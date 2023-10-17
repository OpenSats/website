import { ReactNode } from 'react'
import type { Project } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import PageSection from '@/components/PageSection'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<Project>
}

export default function PageLayout({ children, content }: Props) {
  const { title, summary, coverImage, website, git, twitter } = content

  return (
    <>
      <PageSEO title={`${title} - OpenSats`} description={`${summary}`} />
      <PageSection
        title={title}
        image={coverImage}
        website={website}
        git={git}
        twitter={twitter}
      >
        {children}
      </PageSection>
    </>
  )
}
