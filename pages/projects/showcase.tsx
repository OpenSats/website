import type { NextPage } from 'next'
import Head from 'next/head'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import ProjectGroup from '@/components/ProjectGroup'
import { getFundPageCopy, getProjectsForFund } from '@/utils/projectShowcase'

type Props = {
  projects: Project[]
}

const ProjectShowcase: NextPage<Props> = ({ projects }) => {
  const generalProjects = getProjectsForFund(projects, 'general')
  const nostrProjects = getProjectsForFund(projects, 'nostr')
  const generalCopy = getFundPageCopy('general')
  const nostrCopy = getFundPageCopy('nostr')

  return (
    <>
      <Head>
        <title>OpenSats | Project Showcase</title>
      </Head>

      <div className="space-y-14 pb-12 pt-6">
        <section className="max-w-4xl space-y-5">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
              Project showcase
            </h1>
            <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
              Browse the projects currently listed on the site, grouped by the
              fund they sit under.
            </p>
            <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
              Projects marked for showcase rise to the top inside each section.
              Everything else follows alphabetically.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <CustomLink
              href="#general-projects"
              className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
            >
              General Fund
            </CustomLink>
            <CustomLink
              href="#nostr-projects"
              className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
            >
              Nostr Fund
            </CustomLink>
            <CustomLink
              href="/funds"
              className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
            >
              Compare funds
            </CustomLink>
          </div>
        </section>

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
