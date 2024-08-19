import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'

import Layout from '../components/Layout'
import { Toaster } from '../components/ui/toaster'
import { trpc } from '../utils/trpc'
import { useFundSlug } from '../utils/use-fund-slug'

import '../styles/globals.css'

function MyApp({ Component, pageProps, router }: AppProps) {
  const fundSlug = useFundSlug()

  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute="class" forcedTheme={fundSlug as string} enableSystem={false}>
        <Head>
          <meta content="width=device-width, initial-scale=1" name="viewport" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}

export default trpc.withTRPC(MyApp)
