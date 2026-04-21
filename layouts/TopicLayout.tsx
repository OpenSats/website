import { ReactNode } from 'react'
import type { Topic } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import { CoreContent } from 'pliny/utils/contentlayer'
import PageHeading from '@/components/PageHeading'
import Link from '@/components/Link'

interface Props {
  children: ReactNode
  content: CoreContent<Topic>
}

export default function TopicLayout({ children, content }: Props) {
  const { title, summary, category, aliases } = content
  return (
    <>
      <PageSEO title={`${title} - OpenSats Topics`} description={summary} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <PageHeading title={title}>
          <div className="hidden xl:block" />
          <div className="space-y-8 xl:col-span-2">
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Category:
                </span>{' '}
                <Link
                  href={`/topics/categories#${category.toLowerCase()}`}
                  className="underline-offset-2 hover:underline"
                >
                  {category}
                </Link>
              </div>
              {aliases && aliases.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Also covering:
                  </span>{' '}
                  <span className="italic">{aliases.join(', ')}</span>
                </div>
              )}
            </div>
            <div className="prose max-w-none pb-8 dark:prose-dark">
              {children}
            </div>
          </div>
        </PageHeading>
      </div>
      <nav className="pb-8 pt-6 text-sm">
        <Link
          href="/topics"
          className="text-gray-600 hover:text-orange-500 dark:text-gray-400"
        >
          &larr; All topics
        </Link>
      </nav>
    </>
  )
}
