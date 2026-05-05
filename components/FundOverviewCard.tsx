import type { Fund } from 'contentlayer/generated'
import Image from '@/components/Image'
import CustomLink from '@/components/Link'
import {
  countProjectsForFund,
  getFundDonateUrl,
  getFundPageCopy,
} from '@/utils/projectShowcase'
import type { Project } from 'contentlayer/generated'

type Props = {
  fund: Fund
  projects: Project[]
}

export default function FundOverviewCard({ fund, projects }: Props) {
  const fundCopy = getFundPageCopy(fund.slug)
  const projectCount = countProjectsForFund(projects, fund.slug)

  return (
    <article className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${fundCopy.badgeClassName}`}
          >
            {fundCopy.eyebrow}
          </span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {fund.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {fund.summary}
            </p>
          </div>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-stone-50 p-3 dark:bg-stone-950">
          <Image
            alt={fund.title}
            src={fund.coverImage}
            width={160}
            height={160}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {fundCopy.helper}
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 text-sm dark:border-gray-800 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Directory coverage
          </dt>
          <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
            {projectCount > 0
              ? `${projectCount} listed project${projectCount === 1 ? '' : 's'}`
              : 'OpenSats operating costs'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Best used for
          </dt>
          <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
            {fund.slug === 'ops'
              ? 'Keeping the organization running'
              : 'Routing donations by mission area'}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <CustomLink
          href={`/funds/${fund.slug}`}
          className="inline-flex rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:border-primary-500 hover:text-primary-500 dark:border-gray-700 dark:text-gray-100 dark:hover:border-primary-400 dark:hover:text-primary-400"
        >
          Read fund page
        </CustomLink>
        <CustomLink
          href={getFundDonateUrl(fund.slug)}
          className="inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 dark:bg-white dark:text-black dark:hover:bg-primary-400"
        >
          Give monthly
        </CustomLink>
      </div>
    </article>
  )
}
