// Central authors registry. Add more authors here as the blog grows.

export const AUTHORS = {
  'andrei-munteanu': {
    slug: 'andrei-munteanu',
    name: 'Andrei Munteanu',
    displayName: 'Andrei',
    avatar: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=600&fit=crop',
    jobTitle: 'Travel Blogger & Fondator',
    company: 'Destinația Următoare',
    email: 'contact@destinatiaurmatoare.eu',
    location: 'București, România',
    bio: 'Călătoresc de peste 10 ani și scriu ghiduri detaliate pentru cei care își doresc mai mult decât o vacanță – vor experiențe autentice, itinerarii inteligente și sfaturi verificate. Am vizitat 40+ țări pe 5 continente și continui să descopăr locuri care merită împărtășite.',
    expertise: [
      'Ghiduri detaliate & itinerarii',
      'Călătorii cu buget mic',
      'City break-uri în Europa',
      'Aventuri în Asia de Sud-Est',
      'Fotografie de călătorie',
    ],
    stats: {
      years: '10+',
      countries: '40+',
      articles: 'în creștere',
    },
    social: {
      instagram: 'https://instagram.com/destinatiaurmatoare',
      facebook: 'https://facebook.com/destinatiaurmatoare',
      youtube: null,
      twitter: null,
    },
    // Match key used in article.author field (case-insensitive contains)
    matchNames: ['Andrei Munteanu', 'Andrei'],
  },
}

export const getAuthorBySlug = (slug) => AUTHORS[slug] || null

// Given an article author string (from DB), find matching author entry.
export const findAuthorForArticle = (articleAuthor = '') => {
  const q = String(articleAuthor).trim().toLowerCase()
  if (!q) return AUTHORS['andrei-munteanu']
  for (const a of Object.values(AUTHORS)) {
    if (a.matchNames.some(n => n.toLowerCase() === q || q.includes(n.toLowerCase()))) return a
  }
  return AUTHORS['andrei-munteanu'] // default
}
