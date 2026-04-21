import { ReactNode } from 'react'
import type { Topic } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import { CoreContent } from 'pliny/utils/contentlayer'
import PageHeading from '@/components/PageHeading'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'

interface Props {
  children: ReactNode
  content: CoreContent<Topic>
}

export default function TopicLayout({ children, content }: Props) {
  const { title, summary, aliases, filePath } = content
  const repo = siteMetadata.siteRepo.replace(/\/$/, '')
  const editUrl = `${repo}/edit/main/data/${filePath}`
  return (
    <>
      <PageSEO title={`${title} - OpenSats Topics`} description={summary} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <PageHeading title={title}>
          <div className="hidden xl:block" />
          <div className="space-y-6 xl:col-span-2">
            {aliases && aliases.length > 0 && (
              <p className="text-sm italic text-gray-500 dark:text-gray-400">
                Also covering {aliases.join(', ')}
              </p>
            )}
            <div className="prose max-w-none pb-8 dark:prose-dark">
              {children}
            </div>
          </div>
        </PageHeading>
      </div>
      <nav className="flex items-center justify-between gap-4 pb-8 pt-6 text-sm">
        <Link
          href="/topics"
          className="text-gray-600 hover:text-orange-500 dark:text-gray-400"
        >
          &larr; All topics
        </Link>
        <Link
          href={editUrl}
          className="text-gray-600 hover:text-orange-500 dark:text-gray-400"
        >
          Propose edit on GitHub &rarr;
        </Link>
      </nav>
    </>
  )
}
