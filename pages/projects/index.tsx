import type { GetStaticProps, NextPage } from 'next'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import ShowcaseProjectEntry from '@/components/ShowcaseProjectEntry'
import type { FundId } from '@/components/ShowcaseProjectEntry'
import { allProjects } from 'contentlayer/generated'
import { buildClusters } from '@/utils/projectClusters'

type EntryData = {
  slug: string
  title: string
  summary: string
  coverImage: string
  darkCoverImage?: string
  invertDarkImage?: boolean
  nym: string
  fund?: FundId
}

type RenderCluster = {
  id: string
  title: string
  blurb: string
  projects: EntryData[]
}

type ShowcaseProps = {
  clusters: RenderCluster[]
}

const KNOWN_FUNDS: FundId[] = ['general', 'nostr', 'ops']

function toEntryData(project: (typeof allProjects)[number]): EntryData {
  const fund = (KNOWN_FUNDS as string[]).includes(project.fund || '')
    ? (project.fund as FundId)
    : undefined

  return {
    slug: `/projects/${project.slug}`,
    title: project.title,
    summary: project.summary,
    coverImage: project.coverImage,
    darkCoverImage: project.darkCoverImage,
    invertDarkImage: project.invertDarkImage,
    nym: project.nym,
    fund,
  }
}

const ProjectShowcase: NextPage<ShowcaseProps> = ({ clusters }) => {
  return (
    <>
      <PageSEO
        title="Project Showcase - OpenSats"
        description="A showcase of free and open-source Bitcoin and Nostr projects supported by OpenSats."
      />

      <section className="pt-4 md:pb-8">
        <h1 className="py-2 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 max-[375px]:text-2xl sm:text-3xl sm:leading-10 md:py-4 md:text-5xl md:leading-14 lg:text-6xl">
          Project Showcase
        </h1>
        <p className="max-w-3xl pt-3 text-lg leading-7 text-gray-500 dark:text-gray-400">
          Below is a showcase of projects we fund or have funded in the past.
          The list is not exhaustive. For the full list, see our{' '}
          <Link
            href="/tags/grants"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            grant announcements
          </Link>
          .
        </p>
      </section>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {clusters.map((cluster) => (
          <section
            key={cluster.id}
            className="grid gap-8 py-10 first:pt-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12"
          >
            <div>
              <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                {cluster.title}
              </h2>
              <p className="pt-2 text-base leading-7 text-gray-500 dark:text-gray-400">
                {cluster.blurb}
              </p>
            </div>

            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {cluster.projects.map((project) => (
                <ShowcaseProjectEntry key={project.slug} {...project} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-6 pt-4 text-base font-medium leading-6">
        <Link
          href="/apply"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          aria-label="Apply for funding"
        >
          Apply for funding &rarr;
        </Link>
        <Link
          href="/tags/grants"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          aria-label="All grant announcements"
        >
          All grant announcements &rarr;
        </Link>
      </div>
    </>
  )
}

export default ProjectShowcase

export const getStaticProps: GetStaticProps<ShowcaseProps> = async () => {
  const clusters: RenderCluster[] = buildClusters(allProjects).map(
    (cluster) => ({
      id: cluster.id,
      title: cluster.title,
      blurb: cluster.blurb,
      projects: cluster.projects.map((project) => toEntryData(project)),
    })
  )

  return {
    props: JSON.parse(JSON.stringify({ clusters })),
    revalidate: 60 * 60 * 12,
  }
}
