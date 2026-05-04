import { ReactNode } from 'react'
import type { Topic } from 'contentlayer/generated'
import { TopicSEO } from '@/components/SEO'
import { CoreContent } from 'pliny/utils/contentlayer'
import { getDisplayAliases } from '@/utils/topics'

interface Props {
  children: ReactNode
  content: CoreContent<Topic>
}

export default function TopicLayout({ children, content }: Props) {
  const { title, summary, slug } = content
  const aliasList = getDisplayAliases(content)
  const hasAliases = aliasList.length > 0
  return (
    <>
      <TopicSEO
        title={`${title} - OpenSats Topics`}
        description={summary}
        slug={slug}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 pb-8 pt-6 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div></div>
          <div className="xl:col-span-2">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
              {title}
            </h1>
            {hasAliases && (
              <p className="mt-2 text-sm italic text-gray-400 dark:text-gray-500">
                {aliasList.join(', ')}
              </p>
            )}
            {summary && (
              <p className="mt-4 text-lg leading-7 text-gray-500 dark:text-gray-400">
                {summary}
              </p>
            )}
          </div>
        </div>
        <div className="items-start xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div className="hidden xl:block" />
          <div className="prose max-w-none pb-8 pt-8 dark:prose-dark xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
