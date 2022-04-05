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
        <title>OpenSats</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="flex justify-between p-4 md:p-8 bg-light">
        <div className="flex flex-col">
          <strong>© Open Sats Initiative, 2022</strong>
          <Link href="/terms">
            <a>Terms</a>
          </Link>
          <Link href="/privacy">
            <a>Privacy</a>
          </Link>
        </div>
        <Link href="#" passHref>
          <div className="flex items-center hover:underline cursor-pointer">
            <strong>Submit a bug</strong>
            <FontAwesomeIcon
              icon={faBug}
              className="ml-2 w-4 h-4 cursor-pointer"
            />
          </div>
        </Link>
      </footer>
    </div>
  )
}

export default Layout
