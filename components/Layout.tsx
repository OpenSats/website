import Navbar from './Header'
import React from 'react'
import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBug } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Head>
        <title>OpenSats</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@OpenSats" />

        {/* Open Graph */}
        <meta property="og:url" content="https://opensats.org" key="ogurl" />
        <meta
          property="og:image"
          content="https://opensats.vercel.app/twitter.png"
          key="ogimage"
        />
        <meta property="og:site_name" content="OpenSats" key="ogsitename" />
        <meta property="og:title" content="OpenSats" key="ogtitle" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:description"
          content="Support contributors to Bitcoin and other free and open-source projects"
          key="ogdesc"
        />
      </Head>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="bg-light flex justify-between p-4 md:p-8">
        <div className="flex flex-col">
          <strong>© 2023 Open Sats Initiative, Inc. (EIN 85-2722249)</strong>
          <Link href="/terms">
            <a>Terms</a>
          </Link>
          <Link href="/privacy">
            <a>Privacy</a>
          </Link>
          <div>
            <p>
              Need help?{' '}
              <Link href="mailto:support@opensats.org">
                support@opensats.org
              </Link>
            </p>
          </div>
        </div>
        <Link href="https://github.com/opensats/website" passHref>
          <a>
            <div className="flex cursor-pointer items-center hover:underline">
              <strong>Submit a bug</strong>
              <FontAwesomeIcon
                icon={faBug}
                className="ml-2 h-4 w-4 cursor-pointer"
              />
            </div>
          </a>
        </Link>
      </footer>
    </div>
  )
}

export default Layout
