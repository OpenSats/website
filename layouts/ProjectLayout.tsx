import { ReactNode } from 'react'
import type { Project } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import SocialIcon from '@/components/social-icons'
import PageSection from '@/components/PageSection'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<Project>
}

export default function PageLayout({ children, content }: Props) {
  const {
    title,
    summary,
    coverImage,
    website,
    git,
    twitter,
  } = content

  return (
    <>
      <PageSEO title={`${title} - OpenSats`} description={`${summary}`} />
      <PageSection title={title} image={coverImage}>
        {children}
      </PageSection>

      <div className="flex space-x-3 pt-6">
        <SocialIcon kind="github" href={git} />
        <SocialIcon kind="twitter" href={`https://twitter.com/${twitter}`} />
        <SocialIcon kind="website" href={website} />
      </div>
      
    </>
  )
}
