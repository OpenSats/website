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
      <article className="relative grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3 pr-6 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-5 sm:pr-0">
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
          <p className="hidden pt-3 text-right text-sm font-medium leading-6 sm:block">
            <Link
              href={slug}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            >
              Learn more &rarr;
            </Link>
          </p>
        </div>

        <Link
          href={slug}
          aria-label={`Learn more about ${title}`}
          className="absolute inset-y-0 -right-1 flex items-center text-gray-300 transition-colors hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500 sm:hidden"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M7.22 4.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </article>
    </li>
  )
}

export default ShowcaseProjectEntry
