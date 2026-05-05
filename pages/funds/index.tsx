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

          <ul className="border-b border-gray-200 dark:border-gray-800">
            {funds.map((fund) => (
              <li key={fund.slug}>
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
                  className="border-y border-gray-200 py-8 dark:border-gray-800"
                >
                  <div className="max-w-3xl space-y-4">
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.18em] ${fundCopy.eyebrowClassName}`}
                    >
                      {fundCopy.showcaseHeading}
                    </p>
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

                  <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
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
