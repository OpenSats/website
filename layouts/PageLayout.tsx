import { ReactNode } from 'react'
import type { Pages } from 'content-collections'
import { PageSEO } from '@/components/SEO'
import PageSection from '@/components/PageSection'
import { CoreContent } from 'pliny/utils/contentlayer.js'

interface Props {
  children: ReactNode
  content: CoreContent<Pages>
}

export default function PageLayout({ children, content }: Props) {
  const { title, summary, image, slug } = content

  return (
    <>
      <PageSEO
        title={`${title} - OpenSats`}
        description={`${summary}`}
        slug={slug}
      />
      <PageSection title={title} image={image}>
        {children}
      </PageSection>
    </>
  )
}
