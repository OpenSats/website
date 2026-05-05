import type { NextPage } from 'next'
import Head from 'next/head'
import { allFunds, allProjects } from 'contentlayer/generated'
import type { Fund, Project } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import FundOverviewCard from '@/components/FundOverviewCard'
import ProjectDirectoryCard from '@/components/ProjectDirectoryCard'
import {
  getFundPageCopy,
  getProjectsForFund,
  sortFunds,
} from '@/utils/projectShowcase'

type Props = {
  funds: Fund[]
  projects: Project[]
}

const FundsPage: NextPage<Props> = ({ funds, projects }) => {
  return (
    <>
      <Head>
        <title>OpenSats | Funds</title>
      </Head>

      <div className="space-y-14 pb-12 pt-6">
        <section className="max-w-4xl space-y-5">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
              Choose a fund
            </h1>
            <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
              OpenSats runs three separate funding buckets. This page is for the
              donor decision first: what kind of work do you want your money to
              support?
            </p>
            <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
              The General Fund and The Nostr Fund route donations outward to
              listed projects and contributors. The Operations Budget covers the
              organization itself and keeps pass-through project donations
              intact.
            </p>
            <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
              Keep it simple: choose the mission area you want to support, then
              donate into that bucket.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {funds.map((fund) => (
              <CustomLink
                key={fund.slug}
                href={`#${fund.slug}`}
                className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
              >
                {fund.title}
              </CustomLink>
            ))}
            <CustomLink
              href="/projects/showcase"
              className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
            >
              Browse all projects
            </CustomLink>
          </div>
        </section>

        <div className="border-b border-gray-200 dark:border-gray-800">
          {funds.map((fund) => {
            const fundCopy = getFundPageCopy(fund.slug)
            const fundProjects = getProjectsForFund(projects, fund.slug)
            const previewProjects = fundProjects.slice(0, 3)

            return (
              <FundOverviewCard
                key={fund.slug}
                id={fund.slug}
                fund={fund}
                projects={projects}
              >
                {fund.slug === 'ops' ? (
                  <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {fundCopy.emptyState}
                  </p>
                ) : (
                  <div className="space-y-4 pt-1">
                    <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                      {fundCopy.showcaseDescription} {fundProjects.length}{' '}
                      listed project{fundProjects.length === 1 ? '' : 's'}
                      currently sit under this fund.
                    </p>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                        Selected projects
                      </p>
                      <ul className="mt-3 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                        {previewProjects.map((project) => (
                          <li key={project.slug}>
                            <ProjectDirectoryCard project={project} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-sm font-semibold">
                      <CustomLink
                        href={`/projects/showcase#${fund.slug}-projects`}
                        className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
                      >
                        Browse all {fund.title} projects
                      </CustomLink>
                    </div>
                  </div>
                )}
              </FundOverviewCard>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default FundsPage

export async function getStaticProps() {
  const funds = sortFunds(allFunds.filter((fund) => !fund.hidden))
  const projects = allProjects.filter((project) => !project.hidden)

  return {
    props: {
      funds,
      projects,
    },
  }
}

export function isOpenSatsProject(project: Project): boolean {
  return project.nym === 'OpenSats'
}

export function isNotOpenSatsProject(project: Project): boolean {
  return !isOpenSatsProject(project)
}

export function isShowcaseProject(project: Project): boolean {
  return isNotOpenSatsProject(project) && Boolean(project.showcase)
}
