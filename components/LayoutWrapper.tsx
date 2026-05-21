import SectionContainer from './SectionContainer'
import Footer from './Footer'
import { ReactNode } from 'react'
import Header from './Header'

interface Props {
  children: ReactNode
  theme?: 'default' | 'nostr'
  headerOverlay?: boolean
}

const LayoutWrapper = ({
  children,
  theme = 'default',
  headerOverlay = false,
}: Props) => {
  return (
    <SectionContainer>
      <div
        className={`flex min-h-screen flex-col justify-between font-sans ${
          theme === 'nostr' ? 'site-theme--nostr' : ''
        } ${headerOverlay ? 'relative' : ''}`}
      >
        <Header
          theme={theme}
          overlay={headerOverlay}
          className={
            headerOverlay
              ? 'absolute inset-x-0 top-0 z-30 bg-transparent py-6 sm:py-8'
              : undefined
          }
        />
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
