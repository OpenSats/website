import Image from '@/components/Image'
import Link from '@/components/Link'

const FUND_LABELS: Record<FundId, string> = {
  general: 'General Fund',
  nostr: 'Nostr Fund',
  ops: 'Operations Budget',
}

export type FundId = 'general' | 'nostr' | 'ops'

export type ShowcaseProjectEntryProps = {
  slug: string
  title: string
  summary: string
  coverImage: string
  darkCoverImage?: string
  invertDarkImage?: boolean
  nym: string
  fund?: FundId
}

const ShowcaseProjectEntry: React.FC<ShowcaseProjectEntryProps> = ({
  slug,
  title,
  summary,
  coverImage,
  darkCoverImage,
  invertDarkImage,
  nym,
  fund,
}) => {
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <article className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-5">
        <Link href={slug} className="block">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border border-gray-200 bg-white dark:border-gray-800 dark:bg-black sm:h-24 sm:w-24">
            <Image
              alt={title}
              src={coverImage}
              darkSrc={darkCoverImage}
              width={96}
              height={96}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              className={`p-2 sm:p-3 ${invertDarkImage ? 'dark:invert' : ''}`}
            />
          </div>
        </Link>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-100">
            <Link
              href={slug}
              className="hover:text-primary-500 dark:hover:text-primary-400"
            >
              {title}
            </Link>
          </h3>
          <p className="pt-1 text-sm text-gray-500 dark:text-gray-400">
            by {nym}
            {fund && (
              <>
                {' · '}
                <Link
                  href={`/funds/${fund}`}
                  className="underline-offset-2 hover:text-primary-500 hover:underline dark:hover:text-primary-400"
                >
                  via the {FUND_LABELS[fund]}
                </Link>
              </>
            )}
          </p>
          <p className="pt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {summary}
          </p>
          <p className="pt-3 text-sm font-medium leading-6">
            <Link
              href={slug}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            >
              View project page &rarr;
            </Link>
          </p>
        </div>
      </article>
    </li>
  )
}

export default ShowcaseProjectEntry
