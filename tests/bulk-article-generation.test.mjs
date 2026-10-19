import assert from 'node:assert/strict'
import test from 'node:test'
import { generateAndSaveBulkArticles } from '../lib/bulk-article-generation.mjs'

const response = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => typeof body === 'string' ? body : JSON.stringify(body),
})

const article = (city) => ({
  title: `Ghid ${city}`,
  slug: `ghid-${city.toLowerCase()}`,
  city,
  tags: [],
  coverImageQuery: 'cover query',
  galleryImageQueries: ['gallery query'],
})

test('retries temporary generation errors and continues through partially failed batches', async () => {
  const calls = []
  const progress = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    const city = JSON.parse(options.body).city

    if (url.endsWith('generate-article') && city === 'Praga' && calls.filter((call) => call.url.endsWith('generate-article') && JSON.parse(call.options.body).city === city).length === 1) {
      return response(503, { error: 'temporar' })
    }
    if (url.endsWith('generate-article') && city === 'Roma') return response(400, { error: 'date invalide' })
    if (url.endsWith('generate-article')) return response(200, { article: article(city) })
    return city === 'Atena' ? response(500, { error: 'database unavailable' }) : response(200, { slug: 'ghid-praga' })
  }

  const results = await generateAndSaveBulkArticles({
    lines: ['Praga, Cehia', 'Roma, Italia', 'Atena, Grecia'],
    defaults: { duration: '5 zile', type: 'City Break', budget: 'mediu' },
    featured: true,
    token: 'token',
    fetchImpl,
    sleep: async () => {},
    onProgress: (value) => progress.push(value),
  })

  assert.deepEqual(results.map(({ city, status }) => ({ city, status })), [
    { city: 'Praga', status: 'success' },
    { city: 'Roma', status: 'error' },
    { city: 'Atena', status: 'error' },
  ])
  assert.match(results[1].error, /date invalide/)
  assert.match(results[2].error, /database unavailable/)
  assert.equal(calls.filter((call) => call.url.endsWith('generate-article')).length, 4)
  const saveBody = JSON.parse(calls.find((call) => call.url.endsWith('save-article')).options.body)
  assert.equal(saveBody.featured, true)
  assert.equal('coverImageQuery' in saveBody, false)
  assert.equal(progress.at(-1).results.length, 3)
})

test('empty batch returns without making requests', async () => {
  let called = false
  const results = await generateAndSaveBulkArticles({
    lines: [],
    defaults: { duration: '5 zile', type: 'City Break', budget: 'mediu' },
    featured: false,
    token: 'token',
    fetchImpl: async () => { called = true },
  })

  assert.deepEqual(results, [])
  assert.equal(called, false)
})

test('budget exhaustion marks remaining cities as skipped', async () => {
  const results = await generateAndSaveBulkArticles({
    lines: ['Lisabona', 'Porto'],
    defaults: { duration: '5 zile', type: 'City Break', budget: 'mediu' },
    featured: false,
    token: 'token',
    fetchImpl: async () => response(402, { code: 'BUDGET_EXCEEDED' }),
    sleep: async () => {},
  })

  assert.deepEqual(results.map(({ city, status, code }) => ({ city, status, code })), [
    { city: 'Lisabona', status: 'error', code: 'BUDGET_EXCEEDED' },
    { city: 'Porto', status: 'error', code: 'SKIPPED' },
  ])
})

test('retries a generation timeout once and reports a clear message if it persists', async () => {
  let calls = 0
  const results = await generateAndSaveBulkArticles({
    lines: ['Hanoi'],
    defaults: { duration: '5 zile', type: 'City Break', budget: 'mediu' },
    featured: false,
    token: 'token',
    fetchImpl: async () => {
      calls++
      return response(504, {
        code: 'AI_TIMEOUT',
        detail: 'Serviciul AI a răspuns prea lent. Încearcă din nou acest oraș; lotul va continua.',
      })
    },
    sleep: async () => {},
  })

  assert.equal(calls, 2)
  assert.equal(results.length, 1)
  assert.equal(results[0].city, 'Hanoi')
  assert.match(results[0].error, /Timeout server după reîncercare/)
  assert.equal(results[0].code, 'AI_TIMEOUT')
})

test('repeated network failures produce one visible failure and do not abort the batch', async () => {
  const results = await generateAndSaveBulkArticles({
    lines: ['Braga', 'Coimbra'],
    defaults: { duration: '5 zile', type: 'City Break', budget: 'mediu' },
    featured: false,
    token: 'token',
    fetchImpl: async (url, options) => {
      const city = JSON.parse(options.body).city
      if (url.endsWith('generate-article') && city === 'Braga') throw new Error('connection reset')
      if (url.endsWith('generate-article')) return response(200, { article: article(city) })
      return response(200, { slug: 'ghid-coimbra' })
    },
    sleep: async () => {},
  })

  assert.equal(results.length, 2)
  assert.match(results[0].error, /connection reset/)
  assert.equal(results[1].status, 'success')
})
