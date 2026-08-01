import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { LanguageProvider } from '../i18n/LanguageContext'
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

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

// Mirrors THEME_INIT_SCRIPT: sets the real <html lang> before hydration so it
// matches the visitor's actual language instead of always reading "en" —
// LanguageContext's detectLang() uses this same stored-value-then-browser
// fallback logic, and setLang() keeps it in sync on later toggles.
const LANG_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('lang');var lang=(stored==='en'||stored==='pt'||stored==='es')?stored:null;if(!lang){var browser=(navigator.language||'en').slice(0,2);lang=(browser==='pt'||browser==='es')?browser:'en';}document.documentElement.lang=lang;}catch(e){}})();`

export const Route = createRootRoute({
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
          jobTitle: 'Full-Stack Developer',
          email: `mailto:${AUTHOR_EMAIL}`,
          sameAs: [LINKEDIN_URL],
        },
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: SANITY_CDN_ORIGIN,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
        {/* Rendered directly (not via head()) because the router dedupes
            meta tags by name, and both of these share name="theme-color". */}
        <meta
          name="theme-color"
          content="#e7f3ec"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#050508"
          media="(prefers-color-scheme: dark)"
        />
        {/* Rendered directly for the same reason: the router dedupes by
            property, and both of these share property="og:locale:alternate". */}
        <meta property="og:locale:alternate" content="pt_BR" />
        <meta property="og:locale:alternate" content="es_ES" />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  )
}
