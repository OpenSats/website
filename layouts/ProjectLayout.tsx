import { ReactNode } from 'react'
import type { Project } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import SocialIcon from '@/components/social-icons'
import { CoreContent } from 'pliny/utils/contentlayer'
import PageHeading from '@/components/PageHeading'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
  content: CoreContent<Project>
}

export default function PageLayout({ children, content }: Props) {
  const { title, summary, coverImage, website, twitter, git, nostr } = content
  return (
    <>
      <PageSEO title={`${title} - OpenSats`} description={`${summary}`} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <PageHeading title={title}>
          <div className="flex flex-col items-center space-x-2 pt-8 xl:block">
            <Image
              src={coverImage}
              alt="avatar"
              width={210}
              height={210}
              className="h-48 w-48"
            />
            <div className="flex space-x-3 pt-6">
              <SocialIcon kind="website" href={website} />
              {twitter && (
                <SocialIcon
                  kind="twitter"
                  href={`https://twitter.com/${twitter}`}
                />
              )}
              <SocialIcon kind="github" href={git} />
              {nostr && (
                <SocialIcon kind="nostr" href={`https://njump.me/${nostr}`} />
              )}
            </div>
          </div>
          <div className="prose max-w-none pb-8 pt-8 dark:prose-dark xl:col-span-2">
            {children}
          </div>
        </PageHeading>
      </div>
    </>
  )
}
