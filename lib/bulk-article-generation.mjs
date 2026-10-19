const parseCityLine = (line, defaults) => {
  const segments = line.split('|').map((segment) => segment.trim())
  const parts = segments[0].split(',').map((part) => part.trim())
  return {
    city: parts[0],
    country: parts[1] || '',
    duration: segments[1] || defaults.duration,
    type: segments[2] || defaults.type,
    budget: segments[3] || defaults.budget,
  }
}

const parseResponse = async (response) => {
  const raw = await response.text()
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const isRetryable = (status) => status === 408 || status === 429 || status >= 500

export async function generateAndSaveBulkArticles({
  lines,
  defaults,
  featured,
  token,
  fetchImpl = fetch,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  onProgress = () => {},
}) {
  const results = []
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token }

  for (let index = 0; index < lines.length; index++) {
    const { city, ...generationOptions } = parseCityLine(lines[index], defaults)
    let result
    let generationResponse
    let generationData

    onProgress({ current: index + 1, total: lines.length, results: [...results] })

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        generationResponse = await fetchImpl('/api/ai/generate-article', {
          method: 'POST',
          headers,
          body: JSON.stringify({ city, ...generationOptions }),
        })
        generationData = await parseResponse(generationResponse)
        if (generationResponse.ok && generationData?.article) break

        if (generationData?.code === 'AI_PROVIDER_NOT_CONFIGURED' || generationData?.code === 'AI_QUOTA_EXCEEDED') {
          break
        }
        if (generationResponse.status === 402 || generationData?.code === 'BUDGET_EXCEEDED') {
          generationData = { ...generationData, code: 'BUDGET_EXCEEDED' }
          break
        }
        if (!isRetryable(generationResponse.status) || attempt === 1) break
      } catch (error) {
        if (attempt === 1) {
          result = { city, status: 'error', error: `Eroare rețea: ${error.message || 'necunoscută'}` }
          break
        }
      }

      await sleep(1000 * (attempt + 1))
    }

    if (generationData?.code === 'BUDGET_EXCEEDED' || generationData?.code === 'AI_QUOTA_EXCEEDED' || generationData?.code === 'AI_PROVIDER_NOT_CONFIGURED') {
      result = {
        city,
        status: 'error',
        error: generationData.detail || generationData.error,
        code: generationData.code,
      }
      results.push(result)
      for (let remaining = index + 1; remaining < lines.length; remaining++) {
        const skippedCity = parseCityLine(lines[remaining], defaults).city
        const reason = generationData.code === 'AI_PROVIDER_NOT_CONFIGURED'
          ? 'Google AI nu este configurat'
          : generationData.code === 'AI_QUOTA_EXCEEDED'
            ? 'Cota Google AI epuizată'
            : 'Bugetul AI epuizat'
        results.push({ city: skippedCity, status: 'error', error: `⏭️ Sărit (${reason})`, code: 'SKIPPED' })
      }
      onProgress({ current: lines.length, total: lines.length, results: [...results] })
      break
    }

    if (!result && generationResponse?.ok && generationData?.article) {
      const article = generationData.article
      const saveBody = {
        ...article,
        featured,
        tags: Array.isArray(article.tags) ? article.tags : [],
        attractions: article.attractions || [],
        restaurants: article.restaurants || [],
        tips: article.tips || [],
        gallery: article.gallery || [],
      }
      delete saveBody.coverImageQuery
      delete saveBody.galleryImageQueries

      try {
        const saveResponse = await fetchImpl('/api/ai/save-article', {
          method: 'POST',
          headers,
          body: JSON.stringify(saveBody),
        })
        const saveData = await parseResponse(saveResponse)
        result = saveResponse.ok
          ? { city, status: 'success', title: article.title, slug: saveData?.slug || article.slug }
          : { city, status: 'error', error: saveData?.detail || saveData?.error || `Eroare salvare (HTTP ${saveResponse.status})` }
      } catch (error) {
        result = { city, status: 'error', error: `Eroare rețea la salvare: ${error.message || 'necunoscută'}` }
      }
    }

    if (!result) {
      const error = generationResponse?.status === 504
        ? '⏱️ Timeout server după reîncercare — încearcă din nou acest oraș'
        : !generationData
          ? `Răspuns invalid (HTTP ${generationResponse?.status || 'necunoscut'}). Reîncearcă.`
          : generationData.code === 'RATE_LIMITED'
        ? '⏳ Prea multe cereri — așteaptă și încearcă din nou'
          : generationData.detail || generationData.error || `Eroare AI (HTTP ${generationResponse?.status || 'necunoscut'})`
      result = { city, status: 'error', error, code: generationData?.code }
    }

    results.push(result)
    onProgress({ current: index + 1, total: lines.length, results: [...results] })
  }

  return results
}
