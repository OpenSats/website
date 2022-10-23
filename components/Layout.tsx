import Navbar from './Header'
import React from 'react'
import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBug } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const Layout: React.FC = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Monero Fund</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@MagicGrants" />

        {/* Open Graph */}
        <meta property="og:url" content="https://monerofund.org/" key="ogurl" />
        <meta property="og:image" content="https://opensats.vercel.app/twitter.png" key="ogimage" />
        <meta property="og:site_name" content="Monero Fund" key="ogsitename" />
        <meta property="og:title" content="Monero Fund" key="ogtitle" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:description" content="Support the Monero Fund and open source research for the Monero Project." key="ogdesc" />
      </Head>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="flex justify-between p-4 md:p-8 bg-light">
       <strong>© Open Sats Initiative and MAGIC Grants, 2022</strong>
      </footer>
    </div>
  )
}

export default Layout
