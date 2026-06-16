import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { DEMO_ARTICLES } from '@/lib/seed-data'

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

      // Related: same continent, exclude self
      const related = await db
        .collection('articles')
        .find({ continent: doc.continent, slug: { $ne: doc.slug } })
        .project({ slug: 1, title: 1, cover: 1, excerpt: 1, country: 1, readingMinutes: 1, type: 1 })
        .limit(3)
        .toArray()

      return handleCORS(NextResponse.json({ article: clean(doc), related: related.map(clean) }))
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

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error', detail: error.message }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
