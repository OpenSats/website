import '@/css/tailwind.css'
import '@/css/prism.css'
import 'katex/dist/katex.css'
// import '@/css/docsearch.css' // Uncomment if using algolia docsearch
// import '@docsearch/css' // Uncomment if using algolia docsearch
import 'styles/globals.css'

import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import siteMetadata from '@/data/siteMetadata'
import { Analytics } from 'pliny/analytics'
import { SearchProvider } from 'pliny/search'
import LayoutWrapper from '@/components/LayoutWrapper'
import ErrorBoundary from '@/components/ErrorBoundary'
import { FathomAnalytics } from '@/components/Fathom'
import {
  getBasePageTheme,
  getHashThemeOverride,
  type SiteTheme,
} from '@/utils/pageTheme'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const baseTheme = getBasePageTheme(pageProps.pageTheme)
  const postSlug = pageProps.post?.slug
  const [theme, setTheme] = useState<SiteTheme>(baseTheme)

  useEffect(() => {
    const syncTheme = () => {
      const hashTheme = getHashThemeOverride(postSlug, window.location.hash)
      setTheme(hashTheme || baseTheme)
    }

    syncTheme()
    window.addEventListener('hashchange', syncTheme)

    return () => {
      window.removeEventListener('hashchange', syncTheme)
    }
  }, [baseTheme, postSlug, router.asPath])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={siteMetadata.theme}
      enableSystem
    >
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <Analytics analyticsConfig={siteMetadata.analytics} />
      <FathomAnalytics />
      <LayoutWrapper theme={theme}>
        <SearchProvider searchConfig={siteMetadata.search}>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </SearchProvider>
      </LayoutWrapper>
    </ThemeProvider>
  )
}
