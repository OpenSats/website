import SectionContainer from './SectionContainer'
import Footer from './Footer'
import { ReactNode } from 'react'
import Header from './Header'
import { postSectionClasses } from '@/components/post/postShared'

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
  const themeClass = theme === 'nostr' ? 'site-theme--nostr' : ''

  if (headerOverlay) {
    return (
      <div
        className={`flex min-h-screen flex-col justify-between font-sans ${themeClass}`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
          <div className={`${postSectionClasses} pointer-events-auto`}>
            <Header
              theme={theme}
              overlay
              className="bg-transparent py-4 sm:py-6 lg:py-8"
            />
          </div>
        </div>
        <main className="mb-auto w-full">{children}</main>
        <SectionContainer>
          <Footer />
        </SectionContainer>
      </div>
    )
  }

  return (
    <SectionContainer>
      <div
        className={`flex min-h-screen flex-col justify-between font-sans ${themeClass}`}
      >
        <Header theme={theme} />
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
