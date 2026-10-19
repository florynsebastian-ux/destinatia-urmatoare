export function classifyGeminiError(error) {
  const message = String(error?.message || '').toLowerCase()
  const status = Number(error?.status || error?.response?.status || 0)

  if (status === 429 || message.includes('quota') || message.includes('resource_exhausted')) {
    return {
      status: 429,
      code: 'AI_QUOTA_EXCEEDED',
      error: 'Cota Google AI epuizată',
      detail: 'Verifică limita și facturarea proiectului Google AI Studio asociat cheii GEMINI_API_KEY.',
    }
  }

  if (status === 401 || status === 403 || message.includes('api key not valid') || message.includes('permission denied')) {
    return {
      status: 503,
      code: 'AI_PROVIDER_NOT_CONFIGURED',
      error: 'Cheia Google AI nu este validă',
      detail: 'Configurează o cheie GEMINI_API_KEY validă în variabilele Production din Vercel.',
    }
  }

  if (message.includes('timeout') || message.includes('timed out') || message.includes('aborted')) {
    return {
      status: 504,
      code: 'AI_TIMEOUT',
      error: 'Generarea articolului a expirat',
      detail: 'Google AI nu a răspuns în timpul disponibil. Reîncearcă orașul; restul lotului poate continua.',
    }
  }

  return {
    status: 503,
    code: 'AI_PROVIDER_UNAVAILABLE',
    error: 'Google AI nu a putut genera articolul',
    detail: 'Verifică logurile funcției în Vercel și statusul Google AI Studio.',
  }
}
