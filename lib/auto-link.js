/**
 * Auto-link helper: scans text and turns keywords (city/country names of other articles)
 * into <Link> elements for internal SEO.
 *
 * Rules:
 * - Case-insensitive match with word boundaries
 * - Only the FIRST occurrence of each keyword is linked (avoids over-optimization / spam)
 * - Longer keywords are matched first ("New York" before "York")
 * - Diacritic-insensitive matching (Bucureşti = Bucuresti = București)
 * - Skips the current article's own city/country
 */
import React from 'react'
import Link from 'next/link'

// Strip Romanian diacritics for matching
const stripDiacritics = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/**
 * Build a link map from a list of articles.
 * @param {Array} articles  - all articles (need slug, city, country)
 * @param {string} currentSlug - slug to exclude (self-linking is useless)
 * @returns {Array<{keyword, normalized, slug, kind}>}  sorted longest first
 */
export function buildLinkMap(articles, currentSlug = '') {
  const seen = new Set()
  const entries = []
  for (const art of articles || []) {
    if (!art?.slug || art.slug === currentSlug) continue
    // Prefer linking to city page; if no city, use country.
    const targets = []
    if (art.city && art.city.trim().length >= 3) targets.push({ keyword: art.city.trim(), kind: 'city' })
    if (art.country && art.country.trim().length >= 3) targets.push({ keyword: art.country.trim(), kind: 'country' })
    for (const t of targets) {
      const norm = stripDiacritics(t.keyword)
      // First article to "claim" a keyword wins (dedup)
      if (seen.has(norm)) continue
      seen.add(norm)
      entries.push({ keyword: t.keyword, normalized: norm, slug: art.slug, kind: t.kind })
    }
  }
  // Sort by keyword length desc so "New York" matches before "York"
  entries.sort((a, b) => b.normalized.length - a.normalized.length)
  return entries
}

/**
 * Convert text (string) to React nodes with internal links.
 * Each keyword links only ONCE across the entire text (per instance of this call).
 * @param {string} text
 * @param {Array} linkMap - result of buildLinkMap
 * @param {Set} usedKeywords - shared set to enforce "one link per keyword per PAGE"
 * @returns React nodes
 */
export function autoLink(text, linkMap = [], usedKeywords = null) {
  if (!text || typeof text !== 'string') return text
  if (!linkMap.length) return text

  const used = usedKeywords || new Set()

  // Escape regex chars in a keyword
  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

  // Diacritic-insensitive scan: iterate through text, at each position check if any keyword matches.
  // We use the normalized form for both text and keyword.
  const normText = stripDiacritics(text)

  // Collect all match positions
  const matches = [] // { start, end, entry }
  for (const entry of linkMap) {
    if (used.has(entry.normalized)) continue
    // Build regex with word boundaries. \b works on ASCII, and since we stripped diacritics, we're good.
    const re = new RegExp(`\\b${escapeRegex(entry.normalized)}\\b`, 'i')
    const m = normText.match(re)
    if (m && typeof m.index === 'number') {
      // Check overlap with earlier matches (skip if it overlaps a longer keyword already picked)
      const overlaps = matches.some(
        (x) => !(m.index + entry.normalized.length <= x.start || m.index >= x.end)
      )
      if (!overlaps) {
        matches.push({ start: m.index, end: m.index + entry.normalized.length, entry })
        used.add(entry.normalized)
      }
    }
  }

  if (matches.length === 0) return text

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start)

  // Build React nodes, preserving original text (with diacritics)
  const nodes = []
  let cursor = 0
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    if (m.start > cursor) nodes.push(text.slice(cursor, m.start))
    const original = text.slice(m.start, m.end) // preserve original casing + diacritics
    nodes.push(
      <Link
        key={`al-${i}-${m.entry.slug}`}
        href={`/blog/${m.entry.slug}`}
        className="text-cyan-700 underline decoration-cyan-300 decoration-1 underline-offset-2 hover:decoration-cyan-600 hover:text-cyan-800 transition-colors font-medium"
        title={`Vezi ghidul complet: ${m.entry.keyword}`}
      >
        {original}
      </Link>
    )
    cursor = m.end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}
