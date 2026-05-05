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
    <article className="grid gap-6 border-t border-gray-200 py-8 dark:border-gray-800 md:grid-cols-[minmax(0,1fr)_96px]">
      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-[0.18em] ${fundCopy.eyebrowClassName}`}
        >
          {fundCopy.eyebrow}
        </p>
        <div className="mt-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {fund.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {fund.summary}
          </p>
        </div>

        <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {fundCopy.helper}
        </p>

        <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Directory coverage
            </dt>
            <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
              {projectCount > 0
                ? `${projectCount} listed project${
                    projectCount === 1 ? '' : 's'
                  }`
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

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <CustomLink
            href={`/funds/${fund.slug}`}
            className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
          >
            Read fund page
          </CustomLink>
          <CustomLink
            href={getFundDonateUrl(fund.slug)}
            className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
          >
            Give monthly
          </CustomLink>
        </div>
      </div>

      <div className="flex h-24 w-24 items-center justify-center self-start border border-gray-200 p-4 dark:border-gray-800">
        <Image
          alt={fund.title}
          src={fund.coverImage}
          width={160}
          height={160}
          className="h-full w-full object-contain"
        />
      </div>
    </article>
  )
}
