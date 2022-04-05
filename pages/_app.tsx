import '@fontsource/source-code-pro/400.css'
import '@fontsource/source-code-pro/600.css'
import '@fontsource/source-code-pro/800.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
