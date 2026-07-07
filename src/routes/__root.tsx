import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { LanguageProvider } from '../i18n/LanguageContext'
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  LINKEDIN_URL,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
} from '../lib/seo'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

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
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:image',
        content: `${SITE_URL}${OG_IMAGE_PATH}`,
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
        {/* Rendered directly (not via head()) because the router dedupes
            meta tags by name, and both of these share name="theme-color". */}
        <meta
          name="theme-color"
          content="#e7f3ec"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0a1418"
          media="(prefers-color-scheme: dark)"
        />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
        <Scripts />
      </body>
    </html>
  )
}
