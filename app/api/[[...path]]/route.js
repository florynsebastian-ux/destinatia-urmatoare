import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { DEMO_ARTICLES } from '@/lib/seed-data'

// Vercel: allow up to 60s for LLM generation
export const maxDuration = 60

let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
    await ensureSeed(db)
  }
  return db
}

let seeded = false
async function ensureSeed(database) {
  if (seeded) return
  try {
    const count = await database.collection('articles').countDocuments()
    if (count === 0) {
      const docs = DEMO_ARTICLES.map((a) => ({
        id: uuidv4(),
        ...a,
        createdAt: new Date(a.publishedAt),
        updatedAt: new Date(),
      }))
      await database.collection('articles').insertMany(docs)
      console.log(`Seeded ${docs.length} demo articles`)
    }
    seeded = true
  } catch (e) {
    console.error('Seed error:', e)
  }
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

function isAuth(request) {
  const token = request.headers.get('x-admin-token')
  return token && token === process.env.ADMIN_PASSWORD
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

function clean(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

async function handleRoute(request, { params }) {
  const resolvedParams = await params
  const { path = [] } = resolvedParams
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Destinația Următoare API up' }))
    }

    // ARTICLES LIST: GET /api/articles?continent=&country=&type=&search=&page=&limit=
    if (route === '/articles' && method === 'GET') {
      const url = new URL(request.url)
      const continent = url.searchParams.get('continent')
      const country = url.searchParams.get('country')
      const type = url.searchParams.get('type')
      const search = url.searchParams.get('search')
      const featured = url.searchParams.get('featured')
      const limit = parseInt(url.searchParams.get('limit') || '12', 10)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const skip = (page - 1) * limit

      const filter = {}
      if (continent) filter.continent = continent
      if (country) filter.country = country
      if (type) filter.type = type
      if (featured === 'true') filter.featured = true
      // Hide scheduled (future-dated) articles from public listing
      // Admin endpoint passes ?includeScheduled=true to see them
      const includeScheduled = url.searchParams.get('includeScheduled') === 'true'
      if (!includeScheduled) {
        filter.publishedAt = { $lte: new Date().toISOString().slice(0, 10) }
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ]
      }

      const total = await db.collection('articles').countDocuments(filter)
      const docs = await db
        .collection('articles')
        .find(filter)
        .project({ intro: 0, attractions: 0, restaurants: 0, tips: 0, gallery: 0, whenToVisit: 0, budget: 0, transport: 0, accommodation: 0 })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      return handleCORS(NextResponse.json({
        items: docs.map(clean),
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      }))
    }

    // ARTICLE BY SLUG: GET /api/articles/by-slug/:slug
    if (path[0] === 'articles' && path[1] === 'by-slug' && path[2] && method === 'GET') {
      const doc = await db.collection('articles').findOne({ slug: path[2] })
      if (!doc) return handleCORS(NextResponse.json({ error: 'Not found' }, { status: 404 }))

      const proj = { slug: 1, title: 1, cover: 1, excerpt: 1, country: 1, city: 1, continent: 1, readingMinutes: 1, type: 1, publishedAt: 1 }
      const excludeSelf = { slug: { $ne: doc.slug } }

      // Same-country articles (highest relevance, e.g., alte ghiduri Franța)
      const sameCountry = doc.country ? await db.collection('articles')
        .find({ ...excludeSelf, country: doc.country })
        .project(proj).limit(6).toArray() : []

      // Same-type articles (e.g., alte City Break-uri)
      const sameCountrySlugs = new Set(sameCountry.map(x => x.slug))
      const sameType = doc.type ? await db.collection('articles')
        .find({ ...excludeSelf, type: doc.type, slug: { $nin: [doc.slug, ...sameCountrySlugs] } })
        .project(proj).limit(6).toArray() : []

      // Same-continent fallback
      const usedSlugs = new Set([...sameCountry, ...sameType].map(x => x.slug))
      const sameContinent = doc.continent ? await db.collection('articles')
        .find({ ...excludeSelf, continent: doc.continent, slug: { $nin: [doc.slug, ...Array.from(usedSlugs)] } })
        .project(proj).limit(6).toArray() : []

      // Flat "related" (top 3 for backward-compat)
      const related = [...sameCountry, ...sameType, ...sameContinent].slice(0, 3)

      return handleCORS(NextResponse.json({
        article: clean(doc),
        related: related.map(clean),
        relatedGroups: {
          sameCountry: sameCountry.slice(0, 4).map(clean),
          sameType: sameType.slice(0, 4).map(clean),
          sameContinent: sameContinent.slice(0, 4).map(clean),
        },
      }))
    }

    // FILTERS META: GET /api/articles/meta
    if (route === '/articles/meta' && method === 'GET') {
      const all = await db.collection('articles').find({}).project({ continent: 1, country: 1, type: 1 }).toArray()
      const continents = [...new Set(all.map((a) => a.continent).filter(Boolean))].sort()
      const countries = [...new Set(all.map((a) => a.country).filter(Boolean))].sort()
      const types = [...new Set(all.map((a) => a.type).filter(Boolean))].sort()
      return handleCORS(NextResponse.json({ continents, countries, types }))
    }

    // ADMIN LOGIN: POST /api/admin/login
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json()
      if (body.password === process.env.ADMIN_PASSWORD) {
        return handleCORS(NextResponse.json({ ok: true, token: process.env.ADMIN_PASSWORD }))
      }
      return handleCORS(NextResponse.json({ ok: false, error: 'Parolă greșită' }, { status: 401 }))
    }

    // ARTICLES CREATE: POST /api/articles
    if (route === '/articles' && method === 'POST') {
      if (!isAuth(request)) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json()
      if (!body.title || !body.slug) {
        return handleCORS(NextResponse.json({ error: 'title și slug sunt obligatorii' }, { status: 400 }))
      }
      const exists = await db.collection('articles').findOne({ slug: body.slug })
      if (exists) return handleCORS(NextResponse.json({ error: 'Slug există deja' }, { status: 400 }))
      const doc = {
        id: uuidv4(),
        ...body,
        readingMinutes: body.readingMinutes || 8,
        featured: !!body.featured,
        publishedAt: body.publishedAt || new Date().toISOString().slice(0, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.collection('articles').insertOne(doc)
      return handleCORS(NextResponse.json(clean(doc)))
    }

    // ARTICLES UPDATE: PUT /api/articles/:id
    if (path[0] === 'articles' && path[1] && method === 'PUT') {
      if (!isAuth(request)) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json()
      delete body._id
      body.updatedAt = new Date()
      await db.collection('articles').updateOne({ id: path[1] }, { $set: body })
      const updated = await db.collection('articles').findOne({ id: path[1] })
      return handleCORS(NextResponse.json(clean(updated)))
    }

    // ARTICLES DELETE: DELETE /api/articles/:id
    if (path[0] === 'articles' && path[1] && method === 'DELETE') {
      if (!isAuth(request)) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      await db.collection('articles').deleteOne({ id: path[1] })
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // NEWSLETTER: POST /api/newsletter
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      if (!body.email || !/^[^@]+@[^@]+\.[^@]+$/.test(body.email)) {
        return handleCORS(NextResponse.json({ error: 'Email invalid' }, { status: 400 }))
      }
      await db.collection('newsletter').updateOne(
        { email: body.email },
        { $set: { email: body.email, createdAt: new Date() } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // CONTACT: POST /api/contact
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      if (!body.name || !body.email || !body.message) {
        return handleCORS(NextResponse.json({ error: 'Câmpuri obligatorii lipsesc' }, { status: 400 }))
      }
      await db.collection('contact').insertOne({
        id: uuidv4(),
        ...body,
        createdAt: new Date(),
      })
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // COMMENTS: GET /api/comments?slug=
    if (route === '/comments' && method === 'GET') {
      const url = new URL(request.url)
      const slug = url.searchParams.get('slug')
      if (!slug) return handleCORS(NextResponse.json({ items: [] }))
      const comments = await db
        .collection('comments')
        .find({ slug })
        .sort({ createdAt: -1 })
        .toArray()
      return handleCORS(NextResponse.json({ items: comments.map(clean) }))
    }

    // COMMENTS: POST /api/comments
    if (route === '/comments' && method === 'POST') {
      const body = await request.json()
      if (!body.slug || !body.name || !body.message) {
        return handleCORS(NextResponse.json({ error: 'Câmpuri obligatorii' }, { status: 400 }))
      }
      const doc = {
        id: uuidv4(),
        slug: body.slug,
        name: body.name,
        message: body.message,
        createdAt: new Date(),
      }
      await db.collection('comments').insertOne(doc)
      return handleCORS(NextResponse.json(clean(doc)))
    }

    // ADMIN: BULK UPDATE YEAR (e.g., 2025 -> 2026 on all articles)
    if (route === '/admin/bulk-update-year' && method === 'POST') {
      if (!isAuth(request)) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json()
      const fromYear = String(body.from || '2025')
      const toYear = String(body.to || '2026')
      // Replace year prefix in publishedAt (stored as ISO date string "YYYY-MM-DD")
      const all = await db.collection('articles').find({}).toArray()
      let updated = 0
      for (const doc of all) {
        const p = doc.publishedAt
        if (typeof p === 'string' && p.startsWith(fromYear + '-')) {
          const newDate = toYear + p.substring(fromYear.length)
          await db.collection('articles').updateOne({ id: doc.id }, { $set: { publishedAt: newDate, updatedAt: new Date().toISOString() } })
          updated++
        } else if (p instanceof Date && p.getUTCFullYear() === parseInt(fromYear)) {
          const nd = new Date(p)
          nd.setUTCFullYear(parseInt(toYear))
          await db.collection('articles').updateOne({ id: doc.id }, { $set: { publishedAt: nd.toISOString().slice(0, 10), updatedAt: new Date().toISOString() } })
          updated++
        }
      }
      return handleCORS(NextResponse.json({ ok: true, updated, total: all.length }))
    }

    // AI ARTICLE GENERATOR: POST /api/ai/generate-article
    if (route === '/ai/generate-article' && method === 'POST') {
      if (!isAuth(request)) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json()
      const { city, country, type = 'City Break', duration = '5 zile', budget = 'mediu' } = body
      if (!city) return handleCORS(NextResponse.json({ error: 'city este obligatoriu' }, { status: 400 }))

      const userPrompt = `Generează un ghid turistic detaliat și profesional pentru:
- Oraș: ${city}
- Țară: ${country || 'detectează automat'}
- Tip călătorie: ${type}
- Durată: ${duration}
- Buget vizat: ${budget}

Scrie complet în limba română cu diacritice, cu detalii concrete (prețuri 2026 în EUR, nume reale de restaurante/cartiere/hoteluri, ore de funcționare, sfaturi practice). Tonul: prietenos, informativ, ca un prieten care a fost acolo.

IMPORTANT: Răspunde DOAR cu un obiect JSON valid (fără text înainte sau după), exact cu structura cerută. NU include în slug niciun caracter special, doar litere mici fără diacritice și cratimă.`

      const systemInstruction = 'Ești un expert în turism și travel blogger profesionist român cu experiență de peste 10 ani. Scrii ghiduri detaliate, practice, cu informații verificate. Tonul tău este prietenos, narativ. Scrii EXCLUSIV în limba română corectă cu diacritice.'

      // JSON schema for Gemini structured output (subset of OpenAPI 3 that Gemini supports)
      const articleSchema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          excerpt: { type: 'string' },
          continent: { type: 'string', enum: ['Europa', 'Asia', 'America', 'Africa', 'Oceania'] },
          country: { type: 'string' },
          city: { type: 'string' },
          intro: { type: 'string' },
          whenToVisit: { type: 'string' },
          budget: { type: 'string' },
          transport: { type: 'string' },
          accommodation: { type: 'string' },
          attractions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['name', 'description'],
            },
          },
          restaurants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['name', 'description'],
            },
          },
          tips: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          readingMinutes: { type: 'number' },
          coverImageQuery: { type: 'string' },
          galleryImageQueries: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'slug', 'excerpt', 'continent', 'country', 'city', 'intro', 'whenToVisit', 'budget', 'transport', 'accommodation', 'attractions', 'restaurants', 'tips', 'tags', 'readingMinutes', 'coverImageQuery', 'galleryImageQueries'],
      }

      // ============================================================
      // Call Google Gemini API (free tier: 1500 requests/day)
      // Falls back to Emergent LLM Gateway if Gemini fails or no key.
      // ============================================================
      let data = null
      let providerUsed = 'none'

      const geminiKey = process.env.GEMINI_API_KEY
      // Try Gemini with retry on transient 503 (high demand)
      const geminiModels = ['gemini-3.8-flash']

      if (geminiKey) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(geminiKey)
        outer: for (const modelName of geminiModels) {
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 4096,
                  responseMimeType: 'application/json',
                  responseSchema: articleSchema,
                },
              })
              const result = await model.generateContent(userPrompt)
              const text = result.response.text()
              data = JSON.parse(text)
              providerUsed = `gemini/${modelName}`
              break outer // success
            } catch (e) {
              const msg = String(e.message || '').slice(0, 200)
              console.error(`Gemini ${modelName} attempt ${attempt}:`, msg)
              // Retry only on 503 (overload); other errors → next model
              if (msg.includes('503') && attempt < 3) {
                await new Promise(r => setTimeout(r, 1500 * attempt)) // 1.5s, 3s
                continue
              }
              break // next model
            }
          }
        }
      }

      // Fallback: Emergent LLM Gateway (Claude Haiku) — only if Gemini failed
      if (!data && process.env.EMERGENT_LLM_KEY) {
        const openai = new OpenAI({
          apiKey: process.env.EMERGENT_LLM_KEY,
          baseURL: 'https://integrations.emergentagent.com/llm',
        })
        const completion = await openai.chat.completions.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          temperature: 0.7,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'create_travel_guide',
              description: 'Creează un ghid turistic complet și structurat',
              parameters: articleSchema,
            },
          }],
          tool_choice: { type: 'function', function: { name: 'create_travel_guide' } },
        })
        const toolCall = completion.choices?.[0]?.message?.tool_calls?.[0]
        if (toolCall?.function?.arguments) {
          data = JSON.parse(toolCall.function.arguments)
          providerUsed = 'emergent'
        }
      }

      if (!data) {
        return handleCORS(NextResponse.json({
          error: 'AI nu a returnat un răspuns valid',
          detail: 'Verifică cheile GEMINI_API_KEY sau EMERGENT_LLM_KEY.',
        }, { status: 500 }))
      }

      // === REAL IMAGES via Pexels API ===
      // Falls back to picsum.photos if Pexels fails / no key / no results.
      const seedFor = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
      const picsumFallback = (q, i = 0, w = 1600, h = 1000) =>
        `https://picsum.photos/seed/${seedFor(q)}-${i}/${w}/${h}`

      const pexelsSearch = async (query, perPage = 6) => {
        try {
          const key = process.env.PEXELS_API_KEY
          if (!key) return []
          // Bias the query toward travel/destination context
          const q = `${query} ${data.city || ''} travel`.trim()
          const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${perPage}&orientation=landscape`
          const r = await fetch(url, { headers: { Authorization: key }, cache: 'no-store' })
          if (!r.ok) return []
          const j = await r.json()
          return (j.photos || []).map((p) => ({
            large: p.src?.landscape || p.src?.large2x || p.src?.large || p.src?.original,
            medium: p.src?.large || p.src?.medium || p.src?.original,
            photographer: p.photographer,
          }))
        } catch {
          return []
        }
      }

      // 1) Cover image — search by main query, take first result in best size
      const coverResults = await pexelsSearch(data.coverImageQuery || data.city, 3)
      data.cover = coverResults[0]?.large || picsumFallback(data.coverImageQuery || data.city, 0, 1600, 1000)

      // 2) Gallery — one search per query, take first result, deduplicate
      const usedUrls = new Set([data.cover])
      const galleryQueries = (data.galleryImageQueries || []).slice(0, 4)
      const gallery = []
      for (let i = 0; i < galleryQueries.length; i++) {
        const q = galleryQueries[i]
        const results = await pexelsSearch(q, 3)
        // pick first result not already used
        const pick = results.find((p) => p.medium && !usedUrls.has(p.medium))
        if (pick) {
          gallery.push(pick.medium)
          usedUrls.add(pick.medium)
        } else {
          gallery.push(picsumFallback(q, i, 1200, 800))
        }
      }
      data.gallery = gallery

      // Default fields
      data.type = type
      data.featured = false
      data.author = 'Andrei Munteanu'
      data.publishedAt = new Date().toISOString().slice(0, 10)
      data._provider = providerUsed // helpful debug info

      return handleCORS(NextResponse.json({ article: data }))
    }

    // AI SAVE: POST /api/ai/save-article
    if (route === '/ai/save-article' && method === 'POST') {
      if (!isAuth(request)) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json()
      if (!body.title || !body.slug) {
        return handleCORS(NextResponse.json({ error: 'title \u0219i slug obligatorii' }, { status: 400 }))
      }
      // ensure unique slug
      let slug = body.slug
      let counter = 1
      while (await db.collection('articles').findOne({ slug })) {
        slug = `${body.slug}-${counter++}`
      }
      const doc = {
        id: uuidv4(),
        ...body,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      delete doc.coverImageQuery
      delete doc.galleryImageQueries
      await db.collection('articles').insertOne(doc)
      return handleCORS(NextResponse.json(clean(doc)))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    const msg = String(error.message || '')
    // Recognize common LLM Gateway budget errors and return a user-friendly message.
    if (msg.includes('Budget has been exceeded') || msg.includes('budget')) {
      return handleCORS(NextResponse.json({
        error: 'Buget LLM depășit',
        detail: 'Cheia AI a atins limita de buget. Solicită buget suplimentar sau înlocuiește cheia EMERGENT_LLM_KEY.',
        code: 'BUDGET_EXCEEDED',
      }, { status: 402 })) // 402 = Payment Required
    }
    if (msg.includes('rate limit') || msg.includes('429')) {
      return handleCORS(NextResponse.json({
        error: 'Prea multe cereri',
        detail: 'Așteaptă câteva minute înainte să încerci din nou.',
        code: 'RATE_LIMITED',
      }, { status: 429 }))
    }
    return handleCORS(NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
