import type { NextPage } from 'next'
import Head from 'next/head'
import { allFunds, allProjects } from 'contentlayer/generated'
import type { Fund, Project } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import FundOverviewCard from '@/components/FundOverviewCard'
import ProjectGroup from '@/components/ProjectGroup'
import {
  getFeaturedProjectsForFund,
  getFundDonateUrl,
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

      <div className="space-y-16 pb-12 pt-6">
        <section className="space-y-8">
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
          </div>

          <div className="flex flex-wrap gap-3">
            {funds.map((fund) => (
              <CustomLink
                key={fund.slug}
                href={`#${fund.slug}`}
                className="inline-flex rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:border-primary-500 hover:text-primary-500 dark:border-gray-700 dark:text-gray-100 dark:hover:border-primary-400 dark:hover:text-primary-400"
              >
                {fund.title}
              </CustomLink>
            ))}
            <CustomLink
              href="/projects/showcase"
              className="inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 dark:bg-white dark:text-black dark:hover:bg-primary-400"
            >
              Browse all projects
            </CustomLink>
          </div>

          <ul className="grid gap-6 xl:grid-cols-3">
            {funds.map((fund) => (
              <li key={fund.slug} className="h-full">
                <FundOverviewCard fund={fund} projects={projects} />
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-16">
          {funds.map((fund) => {
            const fundCopy = getFundPageCopy(fund.slug)
            const fundProjects = getProjectsForFund(projects, fund.slug)

            if (fund.slug === 'ops') {
              return (
                <section
                  key={fund.slug}
                  id={fund.slug}
                  className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-stone-900"
                >
                  <div className="max-w-3xl space-y-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${fundCopy.badgeClassName}`}
                    >
                      {fundCopy.showcaseHeading}
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      {fund.title}
                    </h2>
                    <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
                      {fund.summary}
                    </p>
                    <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
                      {fundCopy.helper}
                    </p>
                    <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
                      {fundCopy.emptyState}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
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
                </section>
              )
            }

            const featuredProjects = getFeaturedProjectsForFund(
              projects,
              fund.slug,
              3
            )
            const projectCountLabel = `${fundProjects.length} listed project${
              fundProjects.length === 1 ? '' : 's'
            } currently sit under this fund in the directory.`

            return (
              <ProjectGroup
                key={fund.slug}
                id={fund.slug}
                title={fundCopy.showcaseHeading}
                description={`${fundCopy.showcaseDescription} ${projectCountLabel}`}
                projects={featuredProjects}
                emptyMessage={fundCopy.emptyState}
                ctaHref={`/projects/showcase#${fund.slug}-projects`}
                ctaLabel={`Browse all ${fund.title} projects`}
              />
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
