import Image from '@/components/Image'
import Link from 'next/link'
import SocialIcon from '@/components/social-icons'
import { getHeartbeatUrl } from '@/utils/heartbeat'

const FUND_LABELS: Record<FundId, string> = {
  general: 'General Fund',
  nostr: 'Nostr Fund',
  ops: 'Operations Budget',
}

export type FundId = 'general' | 'nostr' | 'ops'

export type LastUpdate = { date: string; href: string }

export type ProjectCardProps = {
  slug: string
  title: string
  summary: string
  coverImage: string
  darkCoverImage?: string
  invertDarkImage?: boolean
  nym: string
  fund?: FundId
  lastUpdate?: LastUpdate
  git?: string
  nostr?: string
  heartbeat?: string
  zapstore?: string
  // Accepted for backwards compatibility; the redesigned card no longer
  // surfaces tag chips or per-card image overrides.
  tags?: string[]
  customImageStyles?: React.CSSProperties
}

function shortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  slug,
  title,
  summary,
  coverImage,
  darkCoverImage,
  invertDarkImage,
  nym,
  fund,
  lastUpdate,
  git,
  nostr,
  heartbeat,
  zapstore,
}) => {
  const heartbeatUrl = heartbeat || getHeartbeatUrl(git) || undefined
  const hasFooter = Boolean(
    lastUpdate || git || heartbeatUrl || nostr || zapstore
  )

  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-900">
      <Link href={slug} className="block">
        <div className="relative aspect-[4/3] w-full bg-white dark:bg-black">
          <Image
            alt={title}
            src={coverImage}
            darkSrc={darkCoverImage}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`cursor-pointer object-cover ${
              invertDarkImage ? 'dark:invert' : ''
            }`}
          />
        </div>
      </Link>
      <figcaption className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-bold leading-tight">
          <Link href={slug} className="hover:text-orange-500">
            {title}
          </Link>
        </h2>
        <div className="text-sm text-stone-500 dark:text-stone-400">
          by {nym}
          {fund && (
            <>
              {' · '}
              <Link
                href={`/funds/${fund}`}
                className="underline-offset-2 hover:text-orange-500 hover:underline"
              >
                via the {FUND_LABELS[fund]}
              </Link>
            </>
          )}
        </div>
        <p className="line-clamp-3 text-sm">{summary}</p>
        {hasFooter && (
          <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-stone-500 dark:text-stone-400">
            {lastUpdate ? (
              <Link
                href={lastUpdate.href}
                className="underline-offset-2 hover:text-orange-500 hover:underline"
              >
                Last update · {shortDate(lastUpdate.date)}
              </Link>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-2 [&>a]:opacity-70 [&>a]:transition-opacity [&>a]:hover:opacity-100">
              <SocialIcon kind="github" href={git} size={4} />
              {nostr && (
                <SocialIcon
                  kind="nostr"
                  href={`https://njump.to/${nostr}`}
                  size={4}
                />
              )}
              <SocialIcon kind="zapstore" href={zapstore} size={4} />
              <SocialIcon kind="heartbeat" href={heartbeatUrl} size={4} />
            </span>
          </div>
        )}
      </figcaption>
    </figure>
  )
}

export default ProjectCard
