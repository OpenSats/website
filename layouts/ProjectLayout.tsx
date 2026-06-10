import { ReactNode } from 'react'
import type { Project } from 'contentlayer/generated'
import { FundSEO, ProjectSEO } from '@/components/SEO'
import SocialIcon from '@/components/social-icons'
import { CoreContent } from 'pliny/utils/contentlayer'
import PageHeading from '@/components/PageHeading'
import Image from '@/components/Image'
import { getHeartbeatUrl } from '@/utils/heartbeat'
import { useAnimatedCount } from '@/utils/lifetimeStats'
import Bitcoin from '@/components/social-icons/bitcoin.svg'
import CircleQuestion from '@/components/social-icons/circle-question.svg'
import Link from '@/components/Link'

interface Props {
  children: ReactNode
  content: CoreContent<Project>
  kind?: 'project' | 'fund'
}

export default function PageLayout({
  children,
  content,
  kind = 'project',
}: Props) {
  const {
    title,
    summary,
    slug,
    coverImage,
    darkCoverImage,
    invertDarkImage,
    containCoverImage,
    website,
    twitter,
    git,
    nostr,
    zapstore,
    heartbeat,
    totalSatsSent,
  } = content
  const isFund = kind === 'fund'
  const animatedSatsSent = useAnimatedCount(totalSatsSent ?? 0)
  const heartbeatUrl = heartbeat || getHeartbeatUrl(git)
  const SEO = isFund ? FundSEO : ProjectSEO
  const seoTitle = isFund
    ? `${title} - OpenSats`
    : `${title} - funded by OpenSats`
  return (
    <>
      <SEO title={seoTitle} description={`${summary}`} slug={slug} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <PageHeading title={title}>
          <div className="flex flex-col items-center pt-8 xl:block">
            <Image
              src={coverImage}
              darkSrc={darkCoverImage}
              alt="avatar"
              width={210}
              height={210}
              style={containCoverImage ? { objectFit: 'contain' } : undefined}
              className={`h-48 w-48 ${invertDarkImage ? 'dark:invert' : ''} ${
                isFund ? 'hidden xl:block' : ''
              }`}
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
            {totalSatsSent && (
              <div
                className="pt-4 text-center xl:text-right"
                title={`Total sats sent to ${title} by OpenSats`}
              >
                <p className="flex items-center justify-center gap-2 text-2xl font-medium tabular-nums tracking-tight text-gray-600 dark:text-gray-300 xl:justify-end">
                  <Bitcoin className="h-6 w-6 fill-current" />
                  {Math.round(animatedSatsSent).toLocaleString('en-US')}
                </p>
                <p className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 xl:justify-end">
                  total sats sent
                  <Link
                    href="/transparency"
                    title={`The total amount of sats OpenSats has sent to ${title} to date. Click to learn more on our transparency page.`}
                    aria-label="Learn more about total sats sent"
                    className="opacity-70 transition-opacity hover:opacity-100"
                  >
                    <CircleQuestion className="h-3.5 w-3.5 fill-current" />
                  </Link>
                </p>
              </div>
            )}
          </div>
          <div className="prose max-w-none pb-8 pt-8 dark:prose-dark xl:col-span-2">
            {children}
          </div>
        </PageHeading>
      </div>
    </>
  )
}
