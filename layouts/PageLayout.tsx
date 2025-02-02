import { ReactNode } from 'react'
import type { Pages } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import PageSection from '@/components/PageSection'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<Pages>
}

export default function PageLayout({ children, content }: Props) {
  const { title, summary, image } = content

  return (
    <>
      <PageSEO title={`${title} - OpenSats`} description={`${summary}`} />
      <PageSection title={title} image={image}>
        {children}
      </PageSection>
    </>
  )
}
