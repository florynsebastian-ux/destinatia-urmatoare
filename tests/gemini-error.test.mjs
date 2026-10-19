import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyGeminiError } from '../lib/gemini-error.mjs'

test('classifies Google quota exhaustion distinctly from missing credentials', () => {
  assert.deepEqual(classifyGeminiError({
    status: 429,
    message: 'Resource exhausted: quota exceeded',
  }), {
    status: 429,
    code: 'AI_QUOTA_EXCEEDED',
    error: 'Cota Google AI epuizată',
    detail: 'Verifică limita și facturarea proiectului Google AI Studio asociat cheii GEMINI_API_KEY.',
  })
})

test('classifies invalid Google API credentials without exposing provider details', () => {
  const failure = classifyGeminiError({
    status: 403,
    message: 'API key not valid. Please pass a valid API key.',
  })

  assert.equal(failure.status, 503)
  assert.equal(failure.code, 'AI_PROVIDER_NOT_CONFIGURED')
  assert.match(failure.detail, /Production din Vercel/)
  assert.equal(failure.detail.includes('valid API key'), false)
})

test('classifies aborted generation requests as retryable timeouts', () => {
  assert.equal(classifyGeminiError(new Error('The operation was aborted')).code, 'AI_TIMEOUT')
})
