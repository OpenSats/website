import type { NextPage } from 'next'
import Head from 'next/head'
import { PageSEO } from '@/components/SEO'

const Checkout: NextPage = () => {
  async function handleClick() {
    console.log('yo')
  }
  return (
    <div>
      <PageSEO
        title="Checkout - OpenSats"
        description="Internal checkout testing endpoint."
      />
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main>
        <h1>yooo</h1>
        <button onClick={handleClick}>Heyo</button>

        <p>testing 123</p>
      </main>

      <footer>footer</footer>
    </div>
  )
}

export default Checkout
