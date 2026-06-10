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
    donationLink,
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
            <div className="flex justify-center gap-4 pt-6 xl:w-48 xl:justify-start [&_svg]:text-gray-400 [&_svg]:transition-colors dark:[&_svg]:text-gray-500">
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
              {donationLink && (
                <SocialIcon kind="donate" href={donationLink} size={6} />
              )}
            </div>
            {totalSatsSent && (
              <div
                className="pb-6 pt-14 text-center xl:w-48 xl:text-left"
                title={`Total sats sent to ${title} by OpenSats`}
              >
                <div className="inline-flex flex-col">
                  <p className="flex items-center gap-2 text-2xl font-medium tabular-nums tracking-tight text-gray-600 dark:text-gray-300">
                    <Bitcoin className="h-6 w-6 shrink-0 fill-current text-orange-500 dark:text-orange-400" />
                    {Math.round(animatedSatsSent).toLocaleString('en-US')}
                  </p>
                  <p className="flex items-center gap-1 pl-8 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    total sats sent
                    <Link
                      href="/transparency"
                      title={`All-time sats sent to ${title}. See how OpenSats handles funds, reporting, and grants on our transparency page.`}
                      aria-label="Learn more about total sats sent"
                      className="opacity-70 transition-opacity hover:opacity-100"
                    >
                      <CircleQuestion className="h-3.5 w-3.5 fill-current" />
                    </Link>
                  </p>
                </div>
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
