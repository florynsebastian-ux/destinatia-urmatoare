// Hardcoded country data for the top 30 most-traveled destinations.
// Used as instant fallback / cache for QuickFacts, so the card always renders
// even if restcountries.com is slow or blocked.

export const COUNTRY_FACTS = {
  // KEY: lowercased Romanian country name (with/without diacritics)
  'franța': { flag: '🇫🇷', en: 'France', capital: 'Paris', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Franceză', timezone: 'Europe/Paris', callingCode: '+33', region: 'Europa de Vest' },
  'franta': { flag: '🇫🇷', en: 'France', capital: 'Paris', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Franceză', timezone: 'Europe/Paris', callingCode: '+33', region: 'Europa de Vest' },
  'italia': { flag: '🇮🇹', en: 'Italy', capital: 'Roma', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Italiană', timezone: 'Europe/Rome', callingCode: '+39', region: 'Europa de Sud' },
  'spania': { flag: '🇪🇸', en: 'Spain', capital: 'Madrid', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Spaniolă', timezone: 'Europe/Madrid', callingCode: '+34', region: 'Europa de Sud' },
  'germania': { flag: '🇩🇪', en: 'Germany', capital: 'Berlin', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Germană', timezone: 'Europe/Berlin', callingCode: '+49', region: 'Europa Centrală' },
  'cehia': { flag: '🇨🇿', en: 'Czechia', capital: 'Praga', currency: 'Coroană cehă (Kč)', currencyCode: 'CZK', languages: 'Cehă', timezone: 'Europe/Prague', callingCode: '+420', region: 'Europa Centrală' },
  'polonia': { flag: '🇵🇱', en: 'Poland', capital: 'Varșovia', currency: 'Złoty (zł)', currencyCode: 'PLN', languages: 'Poloneză', timezone: 'Europe/Warsaw', callingCode: '+48', region: 'Europa Centrală' },
  'austria': { flag: '🇦🇹', en: 'Austria', capital: 'Viena', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Germană', timezone: 'Europe/Vienna', callingCode: '+43', region: 'Europa Centrală' },
  'ungaria': { flag: '🇭🇺', en: 'Hungary', capital: 'Budapesta', currency: 'Forint (Ft)', currencyCode: 'HUF', languages: 'Maghiară', timezone: 'Europe/Budapest', callingCode: '+36', region: 'Europa Centrală' },
  'olanda': { flag: '🇳🇱', en: 'Netherlands', capital: 'Amsterdam', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Olandeză', timezone: 'Europe/Amsterdam', callingCode: '+31', region: 'Europa de Vest' },
  'țările de jos': { flag: '🇳🇱', en: 'Netherlands', capital: 'Amsterdam', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Olandeză', timezone: 'Europe/Amsterdam', callingCode: '+31', region: 'Europa de Vest' },
  'belgia': { flag: '🇧🇪', en: 'Belgium', capital: 'Bruxelles', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Olandeză, Franceză, Germană', timezone: 'Europe/Brussels', callingCode: '+32', region: 'Europa de Vest' },
  'grecia': { flag: '🇬🇷', en: 'Greece', capital: 'Atena', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Greacă', timezone: 'Europe/Athens', callingCode: '+30', region: 'Europa de Sud' },
  'portugalia': { flag: '🇵🇹', en: 'Portugal', capital: 'Lisabona', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Portugheză', timezone: 'Europe/Lisbon', callingCode: '+351', region: 'Europa de Sud' },
  'croația': { flag: '🇭🇷', en: 'Croatia', capital: 'Zagreb', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Croată', timezone: 'Europe/Zagreb', callingCode: '+385', region: 'Europa de Sud-Est' },
  'croatia': { flag: '🇭🇷', en: 'Croatia', capital: 'Zagreb', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Croată', timezone: 'Europe/Zagreb', callingCode: '+385', region: 'Europa de Sud-Est' },
  'bulgaria': { flag: '🇧🇬', en: 'Bulgaria', capital: 'Sofia', currency: 'Leva (лв)', currencyCode: 'BGN', languages: 'Bulgară', timezone: 'Europe/Sofia', callingCode: '+359', region: 'Europa de Sud-Est' },
  'românia': { flag: '🇷🇴', en: 'Romania', capital: 'București', currency: 'Leu (RON)', currencyCode: 'RON', languages: 'Română', timezone: 'Europe/Bucharest', callingCode: '+40', region: 'Europa de Sud-Est' },
  'romania': { flag: '🇷🇴', en: 'Romania', capital: 'București', currency: 'Leu (RON)', currencyCode: 'RON', languages: 'Română', timezone: 'Europe/Bucharest', callingCode: '+40', region: 'Europa de Sud-Est' },
  'turcia': { flag: '🇹🇷', en: 'Turkey', capital: 'Ankara', currency: 'Liră (₺)', currencyCode: 'TRY', languages: 'Turcă', timezone: 'Europe/Istanbul', callingCode: '+90', region: 'Asia de Vest' },
  'marea britanie': { flag: '🇬🇧', en: 'United Kingdom', capital: 'Londra', currency: 'Liră sterlină (£)', currencyCode: 'GBP', languages: 'Engleză', timezone: 'Europe/London', callingCode: '+44', region: 'Europa de Nord' },
  'anglia': { flag: '🇬🇧', en: 'United Kingdom', capital: 'Londra', currency: 'Liră sterlină (£)', currencyCode: 'GBP', languages: 'Engleză', timezone: 'Europe/London', callingCode: '+44', region: 'Europa de Nord' },
  'irlanda': { flag: '🇮🇪', en: 'Ireland', capital: 'Dublin', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Engleză, Irlandeză', timezone: 'Europe/Dublin', callingCode: '+353', region: 'Europa de Nord' },
  'norvegia': { flag: '🇳🇴', en: 'Norway', capital: 'Oslo', currency: 'Coroană norvegiană (kr)', currencyCode: 'NOK', languages: 'Norvegiană', timezone: 'Europe/Oslo', callingCode: '+47', region: 'Europa de Nord' },
  'suedia': { flag: '🇸🇪', en: 'Sweden', capital: 'Stockholm', currency: 'Coroană suedeză (kr)', currencyCode: 'SEK', languages: 'Suedeză', timezone: 'Europe/Stockholm', callingCode: '+46', region: 'Europa de Nord' },
  'finlanda': { flag: '🇫🇮', en: 'Finland', capital: 'Helsinki', currency: 'Euro (€)', currencyCode: 'EUR', languages: 'Finlandeză, Suedeză', timezone: 'Europe/Helsinki', callingCode: '+358', region: 'Europa de Nord' },
  'danemarca': { flag: '🇩🇰', en: 'Denmark', capital: 'Copenhaga', currency: 'Coroană daneză (kr)', currencyCode: 'DKK', languages: 'Daneză', timezone: 'Europe/Copenhagen', callingCode: '+45', region: 'Europa de Nord' },
  'elveția': { flag: '🇨🇭', en: 'Switzerland', capital: 'Berna', currency: 'Franc elvețian (CHF)', currencyCode: 'CHF', languages: 'Germană, Franceză, Italiană', timezone: 'Europe/Zurich', callingCode: '+41', region: 'Europa Centrală' },
  'elvetia': { flag: '🇨🇭', en: 'Switzerland', capital: 'Berna', currency: 'Franc elvețian (CHF)', currencyCode: 'CHF', languages: 'Germană, Franceză, Italiană', timezone: 'Europe/Zurich', callingCode: '+41', region: 'Europa Centrală' },
  'islanda': { flag: '🇮🇸', en: 'Iceland', capital: 'Reykjavík', currency: 'Coroană islandeză (kr)', currencyCode: 'ISK', languages: 'Islandeză', timezone: 'Atlantic/Reykjavik', callingCode: '+354', region: 'Europa de Nord' },
  'japonia': { flag: '🇯🇵', en: 'Japan', capital: 'Tokyo', currency: 'Yen (¥)', currencyCode: 'JPY', languages: 'Japoneză', timezone: 'Asia/Tokyo', callingCode: '+81', region: 'Asia de Est' },
  'china': { flag: '🇨🇳', en: 'China', capital: 'Beijing', currency: 'Yuan (¥)', currencyCode: 'CNY', languages: 'Chineză', timezone: 'Asia/Shanghai', callingCode: '+86', region: 'Asia de Est' },
  'thailanda': { flag: '🇹🇭', en: 'Thailand', capital: 'Bangkok', currency: 'Baht (฿)', currencyCode: 'THB', languages: 'Thailandeză', timezone: 'Asia/Bangkok', callingCode: '+66', region: 'Asia de Sud-Est' },
  'vietnam': { flag: '🇻🇳', en: 'Vietnam', capital: 'Hanoi', currency: 'Dong (₫)', currencyCode: 'VND', languages: 'Vietnameză', timezone: 'Asia/Ho_Chi_Minh', callingCode: '+84', region: 'Asia de Sud-Est' },
  'indonezia': { flag: '🇮🇩', en: 'Indonesia', capital: 'Jakarta', currency: 'Rupie (Rp)', currencyCode: 'IDR', languages: 'Indoneziană', timezone: 'Asia/Jakarta', callingCode: '+62', region: 'Asia de Sud-Est' },
  'filipine': { flag: '🇵🇭', en: 'Philippines', capital: 'Manila', currency: 'Peso (₱)', currencyCode: 'PHP', languages: 'Filipineză, Engleză', timezone: 'Asia/Manila', callingCode: '+63', region: 'Asia de Sud-Est' },
  'india': { flag: '🇮🇳', en: 'India', capital: 'New Delhi', currency: 'Rupie (₹)', currencyCode: 'INR', languages: 'Hindi, Engleză', timezone: 'Asia/Kolkata', callingCode: '+91', region: 'Asia de Sud' },
  'singapore': { flag: '🇸🇬', en: 'Singapore', capital: 'Singapore', currency: 'Dolar Singapore (S$)', currencyCode: 'SGD', languages: 'Engleză, Malaeză, Chineză, Tamilă', timezone: 'Asia/Singapore', callingCode: '+65', region: 'Asia de Sud-Est' },
  'coreea de sud': { flag: '🇰🇷', en: 'South Korea', capital: 'Seoul', currency: 'Won (₩)', currencyCode: 'KRW', languages: 'Coreeană', timezone: 'Asia/Seoul', callingCode: '+82', region: 'Asia de Est' },
  'emiratele arabe unite': { flag: '🇦🇪', en: 'UAE', capital: 'Abu Dhabi', currency: 'Dirham (د.إ)', currencyCode: 'AED', languages: 'Arabă', timezone: 'Asia/Dubai', callingCode: '+971', region: 'Asia de Vest' },
  'eau': { flag: '🇦🇪', en: 'UAE', capital: 'Abu Dhabi', currency: 'Dirham (د.إ)', currencyCode: 'AED', languages: 'Arabă', timezone: 'Asia/Dubai', callingCode: '+971', region: 'Asia de Vest' },
  'israel': { flag: '🇮🇱', en: 'Israel', capital: 'Ierusalim', currency: 'Shekel (₪)', currencyCode: 'ILS', languages: 'Ebraică, Arabă', timezone: 'Asia/Jerusalem', callingCode: '+972', region: 'Asia de Vest' },
  'maroc': { flag: '🇲🇦', en: 'Morocco', capital: 'Rabat', currency: 'Dirham (DH)', currencyCode: 'MAD', languages: 'Arabă, Berberă', timezone: 'Africa/Casablanca', callingCode: '+212', region: 'Africa de Nord' },
  'egipt': { flag: '🇪🇬', en: 'Egypt', capital: 'Cairo', currency: 'Liră egipteană (£)', currencyCode: 'EGP', languages: 'Arabă', timezone: 'Africa/Cairo', callingCode: '+20', region: 'Africa de Nord' },
  'africa de sud': { flag: '🇿🇦', en: 'South Africa', capital: 'Pretoria', currency: 'Rand (R)', currencyCode: 'ZAR', languages: 'Engleză, Afrikaans, Zulu', timezone: 'Africa/Johannesburg', callingCode: '+27', region: 'Africa de Sud' },
  'kenya': { flag: '🇰🇪', en: 'Kenya', capital: 'Nairobi', currency: 'Șiling kenyan (KSh)', currencyCode: 'KES', languages: 'Engleză, Swahili', timezone: 'Africa/Nairobi', callingCode: '+254', region: 'Africa de Est' },
  'statele unite': { flag: '🇺🇸', en: 'United States', capital: 'Washington D.C.', currency: 'Dolar SUA ($)', currencyCode: 'USD', languages: 'Engleză', timezone: 'America/New_York', callingCode: '+1', region: 'America de Nord' },
  'sua': { flag: '🇺🇸', en: 'United States', capital: 'Washington D.C.', currency: 'Dolar SUA ($)', currencyCode: 'USD', languages: 'Engleză', timezone: 'America/New_York', callingCode: '+1', region: 'America de Nord' },
  'canada': { flag: '🇨🇦', en: 'Canada', capital: 'Ottawa', currency: 'Dolar canadian (C$)', currencyCode: 'CAD', languages: 'Engleză, Franceză', timezone: 'America/Toronto', callingCode: '+1', region: 'America de Nord' },
  'mexic': { flag: '🇲🇽', en: 'Mexico', capital: 'Ciudad de México', currency: 'Peso mexican ($)', currencyCode: 'MXN', languages: 'Spaniolă', timezone: 'America/Mexico_City', callingCode: '+52', region: 'America de Nord' },
  'brazilia': { flag: '🇧🇷', en: 'Brazil', capital: 'Brasília', currency: 'Real (R$)', currencyCode: 'BRL', languages: 'Portugheză', timezone: 'America/Sao_Paulo', callingCode: '+55', region: 'America de Sud' },
  'argentina': { flag: '🇦🇷', en: 'Argentina', capital: 'Buenos Aires', currency: 'Peso argentinian ($)', currencyCode: 'ARS', languages: 'Spaniolă', timezone: 'America/Argentina/Buenos_Aires', callingCode: '+54', region: 'America de Sud' },
  'australia': { flag: '🇦🇺', en: 'Australia', capital: 'Canberra', currency: 'Dolar australian (A$)', currencyCode: 'AUD', languages: 'Engleză', timezone: 'Australia/Sydney', callingCode: '+61', region: 'Oceania' },
  'noua zeelandă': { flag: '🇳🇿', en: 'New Zealand', capital: 'Wellington', currency: 'Dolar neozeelandez (NZ$)', currencyCode: 'NZD', languages: 'Engleză, Maori', timezone: 'Pacific/Auckland', callingCode: '+64', region: 'Oceania' },
  'noua zeelanda': { flag: '🇳🇿', en: 'New Zealand', capital: 'Wellington', currency: 'Dolar neozeelandez (NZ$)', currencyCode: 'NZD', languages: 'Engleză, Maori', timezone: 'Pacific/Auckland', callingCode: '+64', region: 'Oceania' },
}

/**
 * Get country data by Romanian name. Case-insensitive, accent-tolerant.
 * Returns null if not found.
 */
export function getCountryFacts(name = '') {
  if (!name) return null
  const key = String(name).trim().toLowerCase()
  return COUNTRY_FACTS[key] || null
}
