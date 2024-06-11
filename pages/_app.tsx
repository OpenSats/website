import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import Head from 'next/head'

import Layout from '../components/Layout'
import { trpc } from '../utils/trpc'

import '../styles/globals.css'
import { Toaster } from '../components/ui/toaster'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster />
    </ThemeProvider>
  )
}

export default trpc.withTRPC(MyApp)
