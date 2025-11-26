import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'

interface PostListProps {
  posts: CoreContent<Blog>[]
  rightAlignDate?: boolean
  useProjectLayout?: boolean
}

export default function PostList({
  posts,
  rightAlignDate = false,
  useProjectLayout = false,
}: PostListProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <ul>
      {posts.map((post) => {
        const { path, date, title, summary, tags } = post
        return (
          <li key={path} className="py-4">
            <article
              className={`items-start space-y-2 xl:grid xl:items-baseline xl:space-y-0 ${
                useProjectLayout
                  ? 'xl:grid-cols-3 xl:gap-x-8'
                  : 'xl:grid-cols-4'
              }`}
            >
              <dl>
                <dt className="sr-only">Published on</dt>
                <dd
                  className={`text-base font-medium leading-6 text-gray-500 dark:text-gray-400 ${
                    rightAlignDate ? 'xl:text-right' : ''
                  }`}
                >
                  <time dateTime={date}>
                    {formatDate(date, siteMetadata.locale)}
                  </time>
                </dd>
              </dl>
              <div
                className={`space-y-3 ${
                  useProjectLayout ? 'xl:col-span-2' : 'xl:col-span-3'
                }`}
              >
                <div>
                  <h3 className="text-2xl font-bold leading-8 tracking-tight">
                    <Link
                      href={`/${path}`}
                      className="text-gray-900 dark:text-gray-100"
                    >
                      {title}
                    </Link>
                  </h3>
                  {tags && tags.length > 0 && (
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  )}
                </div>
                {summary && (
                  <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                    {summary}
                  </div>
                )}
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
