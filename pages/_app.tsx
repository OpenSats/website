import '@fontsource/source-code-pro/400.css'
import '@fontsource/source-code-pro/600.css'
import '@fontsource/source-code-pro/800.css'
import '../styles/globals.css'
import '../node_modules/bootstrap/dist/css/bootstrap.css'
import { useEffect } from "react";
import type { AppProps } from 'next/app'

import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    require("../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
  )
}

export default MyApp
