import type { Fund } from 'contentlayer/generated'
import type { ReactNode } from 'react'
import Image from '@/components/Image'
import CustomLink from '@/components/Link'
import {
  countProjectsForFund,
  getFundDonateUrl,
  getFundPageCopy,
} from '@/utils/projectShowcase'
import type { Project } from 'contentlayer/generated'

type Props = {
  id?: string
  fund: Fund
  projects: Project[]
  children?: ReactNode
}

export default function FundOverviewCard({
  id,
  fund,
  projects,
  children,
}: Props) {
  const fundCopy = getFundPageCopy(fund.slug)
  const projectCount = countProjectsForFund(projects, fund.slug)

  return (
    <article
      id={id}
      className="grid gap-8 border-t border-gray-200 py-10 dark:border-gray-800 md:grid-cols-[220px_minmax(0,1fr)]"
    >
      <div className="space-y-4">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.18em] ${fundCopy.eyebrowClassName}`}
        >
          {fundCopy.eyebrow}
        </p>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-gray-200 p-3 dark:border-gray-800">
            <Image
              alt={fund.title}
              src={fund.coverImage}
              width={112}
              height={112}
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {fund.title}
          </h2>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
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

        <dl className="grid gap-y-3 text-sm">
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
        </dl>
      </div>

      <div className="space-y-5">
        <p className="text-base leading-7 text-gray-900 dark:text-gray-100">
          {fund.summary}
        </p>
        <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
          {fundCopy.helper}
        </p>

        {children}
      </div>
    </article>
  )
}
