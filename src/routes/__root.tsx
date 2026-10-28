import { HeadContent, Scripts, createRootRoute, rootRouteId, useMatch } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { LanguageProvider } from '../i18n/LanguageContext'
import { fetchSiteSettings } from '../lib/queries/siteSettings'
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  LINKEDIN_URL,
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  SANITY_CDN_ORIGIN,
  SITE_NAME,
  SITE_URL,
} from '../lib/seo'

import { THEME_INIT_SCRIPT } from '../lib/theme'
import appCss from '../styles.css?url'
// The hero headline (Newsreader 600) is the LCP element: preload its latin
// file. Same module as the @font-face src in src/styles/fonts.css, so Vite
// emits one hashed asset for both.
import headlineFontUrl from '@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?url'


// Mirrors THEME_INIT_SCRIPT: sets the real <html lang> before hydration so it
// matches the visitor's actual language instead of always reading "en" —
// LanguageContext's detectLang() uses this same stored-value-then-browser
// fallback logic, and setLang() keeps it in sync on later toggles.
const LANG_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('lang');var lang=(stored==='en'||stored==='pt'||stored==='es')?stored:null;if(!lang){var browser=(navigator.language||'en').slice(0,2);lang=(browser==='pt'||browser==='es')?browser:'en';}document.documentElement.lang=lang;}catch(e){}})();`

export const Route = createRootRoute({
  // siteSettings feeds the footer on every page and the home page's contact
  // block and SEO (read there from this match). Fetched once per visit: a
  // client navigation doesn't refetch it. Without it, the footer and contact
  // fall back to src/lib/contact.ts.
  loader: () => fetchSiteSettings().catch(() => null),
  staleTime: Infinity,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: DEFAULT_TITLE,
      },
      {
        name: 'description',
        content: DEFAULT_DESCRIPTION,
      },
      {
        name: 'author',
        content: AUTHOR_NAME,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: SITE_NAME,
      },
      {
        property: 'og:locale',
        content: 'en_US',
      },
      {
        property: 'og:image',
        content: `${SITE_URL}${OG_IMAGE_PATH}`,
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        property: 'og:image:type',
        content: 'image/png',
      },
      {
        property: 'og:image:alt',
        content: OG_IMAGE_ALT,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:image',
        content: `${SITE_URL}${OG_IMAGE_PATH}`,
      },
      {
        name: 'twitter:image:alt',
        content: OG_IMAGE_ALT,
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: AUTHOR_NAME,
          alternateName: SITE_NAME,
          url: SITE_URL,
          jobTitle: 'Senior Mobile & Web Engineer',
          email: `mailto:${AUTHOR_EMAIL}`,
          sameAs: [LINKEDIN_URL],
        },
      },
    ],
    links: [
      {
        rel: 'preload',
        href: headlineFontUrl,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: SANITY_CDN_ORIGIN,
      },
      // The SVG follows the browser's color scheme; the .ico is for
      // browsers without SVG favicons.
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: '32x32',
      },
      {
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const settings = useMatch({ from: rootRouteId, shouldThrow: false })?.loaderData
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
        {/* Rendered directly (not via head()) because the router dedupes
            meta tags by name, and both of these share name="theme-color". */}
        <meta
          name="theme-color"
          content="#f3f5f0"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0d1510"
          media="(prefers-color-scheme: dark)"
        />
        {/* Rendered directly for the same reason: the router dedupes by
            property, and both of these share property="og:locale:alternate". */}
        <meta property="og:locale:alternate" content="pt_BR" />
        <meta property="og:locale:alternate" content="es_ES" />
        <HeadContent />
      </head>
      <body>
        <LanguageProvider>
          <Header />
          {children}
          <Footer settings={settings} />
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
        <Scripts />
      </body>
    </html>
  )
}
