import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { allTopics } from 'contentlayer/generated'
import type { Topic } from 'contentlayer/generated'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'

type Entry = {
  label: string
  slug: string
  isAlias: boolean
  sortKey: string
}

type Props = {
  groups: Array<{ letter: string; entries: Entry[] }>
  usedLetters: string[]
  topicCount: number
  aliasCount: number
}

const LETTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function firstLetter(label: string): string {
  const ch = label.trim().charAt(0).toUpperCase()
  if (/[A-Z]/.test(ch)) return ch
  if (/[0-9]/.test(ch)) return '#'
  return '#'
}

function bucketKey(label: string): string {
  const ch = firstLetter(label)
  return ch === '#' ? '#' : ch
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const topics = allTopics as Topic[]

  const entries: Entry[] = []
  for (const t of topics) {
    entries.push({
      label: t.title,
      slug: t.slug,
      isAlias: false,
      sortKey: t.title.toLowerCase(),
    })
    for (const alias of t.aliases || []) {
      entries.push({
        label: alias,
        slug: t.slug,
        isAlias: true,
        sortKey: alias.toLowerCase(),
      })
    }
  }

  entries.sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  const byLetter = new Map<string, Entry[]>()
  for (const entry of entries) {
    const key = bucketKey(entry.label)
    const bucket = byLetter.get(key) || []
    bucket.push(entry)
    byLetter.set(key, bucket)
  }

  const letterOrder = ['#', ...LETTERS.filter((l) => /[A-Z]/.test(l))]
  const groups = letterOrder
    .filter((l) => byLetter.has(l))
    .map((letter) => ({ letter, entries: byLetter.get(letter) || [] }))

  return {
    props: {
      groups,
      usedLetters: groups.map((g) => g.letter),
      topicCount: topics.length,
      aliasCount: entries.length - topics.length,
    },
  }
}

export default function TopicsIndex({
  groups,
  usedLetters,
  topicCount,
  aliasCount,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title={`Topics - ${siteMetadata.title}`}
        description="An index of technical topics covered by OpenSats, with short definitions and pointers for further reading."
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Topics
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Short definitions for technical terms that show up in our blog
            posts.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {topicCount} topics
            {aliasCount > 0 && (
              <>
                {' '}
                (and {aliasCount} aliases in italics for topics with alternative
                names)
              </>
            )}
            .
          </p>
          <div className="flex gap-3 pt-2 text-sm">
            <span className="rounded-full bg-stone-800 px-3 py-1 font-semibold text-white dark:bg-white dark:text-black">
              A-Z
            </span>
            <Link
              href="/topics/categories"
              className="rounded-full border border-stone-800 px-3 py-1 font-semibold text-stone-800 hover:bg-stone-100 dark:border-white dark:text-white dark:hover:bg-stone-800"
            >
              By category
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-3 gap-y-2 pt-6 text-sm font-semibold uppercase">
          {usedLetters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="text-gray-700 hover:text-orange-500 dark:text-gray-200"
            >
              {letter}
            </a>
          ))}
        </nav>

        <div className="space-y-10 pt-8">
          {groups.map(({ letter, entries }) => (
            <section
              key={letter}
              id={`letter-${letter}`}
              className="scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {letter}
              </h2>
              <ul className="mt-3 space-y-2">
                {entries.map((entry, idx) => (
                  <li key={`${entry.slug}-${idx}`}>
                    <Link
                      href={`/topics/${entry.slug}`}
                      className={
                        entry.isAlias
                          ? 'italic text-gray-600 hover:text-orange-500 dark:text-gray-400'
                          : 'text-gray-900 hover:text-orange-500 dark:text-gray-100'
                      }
                    >
                      {entry.label}
                    </Link>
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
