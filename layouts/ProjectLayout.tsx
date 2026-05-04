import { ReactNode } from 'react'
import type { Project } from 'contentlayer/generated'
import { ProjectSEO } from '@/components/SEO'
import SocialIcon from '@/components/social-icons'
import { CoreContent } from 'pliny/utils/contentlayer'
import PageHeading from '@/components/PageHeading'
import Image from '@/components/Image'
import { getHeartbeatUrl } from '@/utils/heartbeat'

interface Props {
  children: ReactNode
  content: CoreContent<Project>
}

export default function PageLayout({ children, content }: Props) {
  const {
    title,
    summary,
    slug,
    coverImage,
    darkCoverImage,
    invertDarkImage,
    website,
    twitter,
    git,
    nostr,
    zapstore,
    heartbeat,
  } = content
  const heartbeatUrl = heartbeat || getHeartbeatUrl(git)
  return (
    <>
      <ProjectSEO
        title={`${title} - funded by OpenSats`}
        description={`${summary}`}
        slug={slug}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <PageHeading title={title}>
          <div className="flex flex-col items-center space-x-2 pt-8 xl:block">
            <Image
              src={coverImage}
              darkSrc={darkCoverImage}
              alt="avatar"
              width={210}
              height={210}
              className={`h-48 w-48 ${invertDarkImage ? 'dark:invert' : ''}`}
            />
            <div className="flex space-x-3 pt-6 [&>a]:opacity-50 [&>a]:transition-opacity [&>a]:hover:opacity-80">
              {zapstore && (
                <SocialIcon kind="zapstore" href={zapstore} size={6} />
              )}
              <SocialIcon kind="github" href={git} size={6} />
              {heartbeatUrl && (
                <SocialIcon kind="heartbeat" href={heartbeatUrl} size={6} />
              )}
              {nostr && (
                <SocialIcon
                  kind="nostr"
                  href={`https://njump.to/${nostr}`}
                  size={6}
                />
              )}
              {twitter && (
                <SocialIcon
                  kind="twitter"
                  href={`https://twitter.com/${twitter}`}
                  size={6}
                />
              )}
              <SocialIcon kind="website" href={website} size={6} />
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
