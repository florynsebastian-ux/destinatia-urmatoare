import './globals.css'
import Script from 'next/script'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import CookieBanner from '@/components/cookie-banner'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinatia-urmatoare.eu'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Destinația Următoare · Ghiduri de călătorie și inspirație pentru aventura ta',
    template: '%s · Destinația Următoare',
  },
  description:
    'Descoperă ghiduri de călătorie detaliate, itinerarii, sfaturi de travel și destinații inspiraționale pentru următoarea ta aventură.',
  keywords: ['travel blog', 'ghiduri turistice', 'destinatii', 'itinerarii', 'sfaturi calatorie', 'destinatia urmatoare', 'travel blog romania', 'vacante', 'city break'],
  authors: [{ name: 'Andrei Munteanu', url: `${BASE_URL}/despre` }],
  creator: 'Andrei Munteanu',
  publisher: 'Destinația Următoare',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Destinația Următoare RSS' }],
    },
  },
  openGraph: {
    title: 'Destinația Următoare · Ghiduri de călătorie',
    description: 'Inspirație, sfaturi și ghiduri detaliate pentru călătoriile tale.',
    type: 'website',
    locale: 'ro_RO',
    siteName: 'Destinația Următoare',
    url: BASE_URL,
  },
  twitter: { card: 'summary_large_image', creator: '@destinatiaurm' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  verification: {},
}

// Site-wide JSON-LD: Organization + WebSite (with Sitelinks Searchbox)
const orgSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Destinația Următoare',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Destinația Următoare',
      description: 'Ghiduri de călătorie, itinerarii și sfaturi de travel.',
      inLanguage: 'ro-RO',
      publisher: { '@id': `${BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/blog?search={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Person',
      '@id': `${BASE_URL}/#author`,
      name: 'Andrei Munteanu',
      url: `${BASE_URL}/despre`,
      jobTitle: 'Travel Blogger',
      worksFor: { '@id': `${BASE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* RSS Feed discovery */}
        <link rel="alternate" type="application/rss+xml" title="Destinația Următoare RSS" href="/feed.xml" />
        {/* Pinterest verification placeholder - replace with your code from pinterest.com/settings/claim */}
        {/* <meta name="p:domain_verify" content="YOUR_PINTEREST_CODE" /> */}
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6538104149883127"
          crossOrigin="anonymous"
        />
        {/* Site-wide structured data: Organization, WebSite, Person */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen bg-white text-slate-800 antialiased">
        <Providers>
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
          <CookieBanner />
        </Providers>

        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
