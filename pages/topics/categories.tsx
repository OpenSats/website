import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { allTopics, allProjects } from 'contentlayer/generated'
import type { Topic } from 'contentlayer/generated'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getTopicLink } from '@/utils/topicProjectLink'

const CATEGORY_ORDER = [
  'Bitcoin',
  'Lightning',
  'Privacy',
  'Ecash',
  'Mining',
  'Nostr',
  'Scaling',
]

type Group = {
  category: string
  topics: Array<{
    href: string
    title: string
    summary: string
    isProject: boolean
  }>
}

type Props = {
  groups: Group[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const topics = allTopics as Topic[]
  const projects = [...allProjects]
  const byCategory = new Map<string, Group['topics']>()

  for (const t of topics) {
    const link = getTopicLink(t, projects)
    const bucket = byCategory.get(t.category) || []
    bucket.push({
      href: link.href,
      title: t.title,
      summary: t.summary,
      isProject: link.isProject,
    })
    byCategory.set(t.category, bucket)
  }

  for (const bucket of byCategory.values()) {
    bucket.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    )
  }

  const ordered: string[] = []
  for (const cat of CATEGORY_ORDER) {
    if (byCategory.has(cat)) ordered.push(cat)
  }
  for (const cat of Array.from(byCategory.keys()).sort()) {
    if (!ordered.includes(cat)) ordered.push(cat)
  }

  const groups: Group[] = ordered.map((category) => ({
    category,
    topics: byCategory.get(category) || [],
  }))

  return {
    props: {
      groups,
    },
  }
}

export default function TopicsByCategory({
  groups,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title={`Topics by category - ${siteMetadata.title}`}
        description="Technical topics covered by OpenSats, grouped by category."
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Topics by category
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            The same topics, grouped by area instead of alphabetized.
          </p>
          <div className="flex gap-3 pt-2 text-sm">
            <Link
              href="/topics"
              className="rounded-full border border-stone-800 px-3 py-1 font-semibold text-stone-800 hover:bg-stone-100 dark:border-white dark:text-white dark:hover:bg-stone-800"
            >
              A-Z
            </Link>
            <span className="rounded-full bg-stone-800 px-3 py-1 font-semibold text-white dark:bg-white dark:text-black">
              By category
            </span>
          </div>
        </div>

        <div className="space-y-10 pt-8">
          {groups.map(({ category, topics }) => (
            <section
              key={category}
              id={category.toLowerCase()}
              className="scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {category}
              </h2>
              <ul className="mt-3 space-y-3">
                {topics.map((t) => (
                  <li key={t.href}>
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={t.href}
                        className="font-semibold text-gray-900 hover:text-orange-500 dark:text-gray-100"
                      >
                        {t.title}
                      </Link>
                      {t.isProject && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                          project
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
