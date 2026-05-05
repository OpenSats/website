import type { NextPage } from 'next'
import Head from 'next/head'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import ProjectGroup from '@/components/ProjectGroup'
import {
  getFundPageCopy,
  getHighlightedProjects,
  getProjectsForFund,
} from '@/utils/projectShowcase'

type Props = {
  projects: Project[]
}

const ProjectShowcase: NextPage<Props> = ({ projects }) => {
  const highlightedProjects = getHighlightedProjects(projects)
  const highlightedProjectCount = projects.filter(
    (project) => project.showcase
  ).length
  const generalProjects = getProjectsForFund(projects, 'general')
  const nostrProjects = getProjectsForFund(projects, 'nostr')
  const generalCopy = getFundPageCopy('general')
  const nostrCopy = getFundPageCopy('nostr')
  const representedFunds = new Set(
    projects.map((project) => project.fund).filter(Boolean)
  ).size

  return (
    <>
      <Head>
        <title>OpenSats | Project Showcase</title>
      </Head>

      <div className="space-y-16 pb-12 pt-6">
        <section className="space-y-8">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
              Project showcase
            </h1>
            <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
              Browse the projects currently listed on the site, grouped by the
              fund they sit under.
            </p>
            <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
              Each card leads with the work itself and sends you into the full
              project page for background, funding context, and announcements.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-stone-900">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Listed projects
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {projects.length}
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-stone-900">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Highlighted projects
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {highlightedProjectCount}
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-stone-900">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Funding tracks represented
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {representedFunds}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <CustomLink
              href="#highlights"
              className="inline-flex rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:border-primary-500 hover:text-primary-500 dark:border-gray-700 dark:text-gray-100 dark:hover:border-primary-400 dark:hover:text-primary-400"
            >
              Highlights
            </CustomLink>
            <CustomLink
              href="#general-projects"
              className="inline-flex rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:border-primary-500 hover:text-primary-500 dark:border-gray-700 dark:text-gray-100 dark:hover:border-primary-400 dark:hover:text-primary-400"
            >
              General Fund
            </CustomLink>
            <CustomLink
              href="#nostr-projects"
              className="inline-flex rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:border-primary-500 hover:text-primary-500 dark:border-gray-700 dark:text-gray-100 dark:hover:border-primary-400 dark:hover:text-primary-400"
            >
              Nostr Fund
            </CustomLink>
            <CustomLink
              href="/funds"
              className="inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 dark:bg-white dark:text-black dark:hover:bg-primary-400"
            >
              Compare funds
            </CustomLink>
          </div>
        </section>

        <ProjectGroup
          id="highlights"
          title="Highlighted projects"
          description="A curated slice of projects that are already marked as highlights in content."
          projects={highlightedProjects}
          ctaHref="#general-projects"
          ctaLabel="Jump into the full directory"
        />

        <ProjectGroup
          id="general-projects"
          title={generalCopy.showcaseHeading}
          description={`${generalCopy.showcaseDescription} ${
            generalProjects.length
          } listed project${
            generalProjects.length === 1 ? '' : 's'
          } currently sit under this fund.`}
          projects={generalProjects}
          emptyMessage={generalCopy.emptyState}
        />

        <ProjectGroup
          id="nostr-projects"
          title={nostrCopy.showcaseHeading}
          description={`${nostrCopy.showcaseDescription} ${
            nostrProjects.length
          } listed project${
            nostrProjects.length === 1 ? '' : 's'
          } currently sit under this fund.`}
          projects={nostrProjects}
          emptyMessage={nostrCopy.emptyState}
        />
      </div>
    </>
  )
}

export default ProjectShowcase

export async function getStaticProps() {
  const projects = allProjects.filter((project) => !project.hidden)

  return {
    props: {
      projects,
    },
  }
}
