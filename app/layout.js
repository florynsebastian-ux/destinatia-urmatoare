import './globals.css'
import Script from 'next/script'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

export const metadata = {
  title: {
    default: 'Destinația Următoare · Ghiduri de călătorie și inspirație pentru aventura ta',
    template: '%s · Destinația Următoare',
  },
  description:
    'Descoperă ghiduri de călătorie detaliate, itinerarii, sfaturi de travel și destinații inspiraționale pentru următoarea ta aventură.',
  keywords: ['travel blog', 'ghiduri turistice', 'destinatii', 'itinerarii', 'sfaturi calatorie', 'destinatia urmatoare'],
  openGraph: {
    title: 'Destinația Următoare · Ghiduri de călătorie',
    description: 'Inspirație, sfaturi și ghiduri detaliate pentru călătoriile tale.',
    type: 'website',
    locale: 'ro_RO',
  },
  twitter: { card: 'summary_large_image' },
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
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6538104149883127"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen bg-white text-slate-800 antialiased">
        <Providers>
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
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
