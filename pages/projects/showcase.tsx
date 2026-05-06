import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Link from '@/components/Link'
import StatsSentence from '@/components/StatsSentence'
import ProjectCard from '@/components/ProjectCard'
import type { FundId } from '@/components/ProjectCard'
import { allBlogs, allProjects } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'
import { sortedBlogPost } from 'pliny/utils/contentlayer'
import { buildClusters } from '@/utils/projectClusters'
import { getLatestPostForProject } from '@/utils/relatedPosts'
import { getLifetimeStats, type LifetimeStat } from '@/utils/lifetimeStats'

type CardData = {
  slug: string
  title: string
  summary: string
  coverImage: string
  darkCoverImage?: string
  invertDarkImage?: boolean
  nym: string
  fund?: FundId
  git?: string
  nostr?: string
  heartbeat?: string
  zapstore?: string
  lastUpdate?: { date: string; href: string }
}

type RenderCluster = {
  id: string
  title: string
  blurb: string
  projects: CardData[]
}

type ShowcaseProps = {
  clusters: RenderCluster[]
  lifetimeStats: LifetimeStat[] | null
}

const KNOWN_FUNDS: FundId[] = ['general', 'nostr', 'ops']

function toCardData(
  project: (typeof allProjects)[number],
  sortedBlogs: Blog[]
): CardData {
  const latest = getLatestPostForProject(project, sortedBlogs)
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
    git: project.git,
    nostr: project.nostr,
    heartbeat: project.heartbeat,
    zapstore: project.zapstore,
    lastUpdate: latest
      ? { date: latest.date, href: `/blog/${latest.slug}` }
      : undefined,
  }
}

const ProjectShowcase: NextPage<ShowcaseProps> = ({
  clusters,
  lifetimeStats,
}) => {
  return (
    <>
      <Head>
        <title>OpenSats | Project Showcase</title>
      </Head>

      <section className="pt-4 md:pb-8">
        <h1 className="py-2 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 max-[375px]:text-2xl sm:text-3xl sm:leading-10 md:py-4 md:text-5xl md:leading-14 lg:text-6xl">
          Project Showcase
        </h1>
        <StatsSentence
          initialStats={lifetimeStats}
          className="text-lg leading-7 text-gray-500 dark:text-gray-400"
        />
      </section>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {clusters.map((cluster) => (
          <section key={cluster.id} className="py-10 first:pt-6">
            <div className="pb-6">
              <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                {cluster.title}
              </h2>
              <p className="pt-1 text-base text-gray-500 dark:text-gray-400">
                {cluster.blurb}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cluster.projects.map((p) => (
                <li key={p.slug}>
                  <ProjectCard {...p} />
                </li>
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
  const sortedBlogs = sortedBlogPost(allBlogs) as Blog[]
  const clusters: RenderCluster[] = buildClusters(allProjects).map((c) => ({
    id: c.id,
    title: c.title,
    blurb: c.blurb,
    projects: c.projects.map((p) => toCardData(p, sortedBlogs)),
  }))

  const lifetimeStats = await getLifetimeStats()

  // Strip `undefined` values so getStaticProps can serialize the payload.
  return {
    props: JSON.parse(JSON.stringify({ clusters, lifetimeStats })),
    revalidate: 60 * 60 * 12,
  }
}
