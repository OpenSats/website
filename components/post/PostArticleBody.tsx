import { useState, ReactNode } from 'react'
import { Comments } from 'pliny/comments'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Link from '@/components/Link'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { discussUrl, editUrl } from '@/components/post/postShared'

interface Props {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
  /** Left-align author row on mobile (spotlight posts). */
  spotlight?: boolean
}

export default function PostArticleBody({
  content,
  authorDetails,
  next,
  prev,
  children,
  spotlight = false,
}: Props) {
  const { filePath, path, slug, tags } = content
  const basePath = path.split('/')[0]
  const [loadComments, setLoadComments] = useState(false)

  return (
    <div
      className={
        spotlight
          ? 'grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 dark:divide-gray-700 min-[1000px]:grid min-[1000px]:grid-cols-4 min-[1000px]:gap-x-6 min-[1000px]:divide-y-0'
          : 'grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0'
      }
    >
      <dl
        className={
          spotlight
            ? 'pb-10 pt-6 min-[1000px]:border-b min-[1000px]:border-gray-200 min-[1000px]:pt-11 min-[1000px]:dark:border-gray-700'
            : 'pb-10 pt-6 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700'
        }
      >
        <dt className="sr-only">Authors</dt>
        <dd>
          <ul
            className={`flex flex-wrap gap-4 ${
              spotlight
                ? 'justify-start min-[1000px]:block min-[1000px]:space-x-0 min-[1000px]:space-y-8'
                : 'justify-center sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8'
            }`}
          >
            {authorDetails.map((author) => (
              <li className="flex items-center space-x-2" key={author.name}>
                {author.avatar && (
                  <Link href={`/about/${author.slug}`}>
                    <Image
                      src={author.avatar}
                      width={38}
                      height={38}
                      alt="avatar"
                      className="h-10 w-10 rounded-full"
                    />
                  </Link>
                )}
                <dl className="whitespace-nowrap text-sm font-medium leading-5">
                  <dt className="sr-only">Name</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {author.name}
                  </dd>
                  <dt className="sr-only">Twitter</dt>
                  <dd>
                    {author.nym && (
                      <Link
                        href={`/about/${author.slug}`}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        @{author.nym}
                      </Link>
                    )}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
        </dd>
      </dl>
      <div
        className={
          spotlight
            ? 'divide-y divide-gray-200 dark:divide-gray-700 min-[1000px]:col-span-3 min-[1000px]:row-span-2 min-[1000px]:pb-0'
            : 'divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0'
        }
      >
        <div className="prose max-w-none pb-8 pt-10 dark:prose-dark">
          {children}
        </div>
        <div className="pb-6 pt-6 text-sm text-gray-700 dark:text-gray-300">
          <Link href={discussUrl()} rel="nofollow">
            Discuss on nostr
          </Link>
          {` • `}
          <Link href={editUrl(filePath)}>View on GitHub</Link>
        </div>
        {siteMetadata.comments && (
          <div
            className="pb-6 pt-6 text-center text-gray-700 dark:text-gray-300"
            id="comment"
          >
            {!loadComments && (
              <button onClick={() => setLoadComments(true)}>
                Load Comments
              </button>
            )}
            {loadComments && (
              <Comments commentsConfig={siteMetadata.comments} slug={slug} />
            )}
          </div>
        )}
      </div>
      <footer>
        <div
          className={
            spotlight
              ? 'divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 min-[1000px]:col-start-1 min-[1000px]:row-start-2 min-[1000px]:divide-y'
              : 'divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 xl:col-start-1 xl:row-start-2 xl:divide-y'
          }
        >
          {tags && (
            <div
              className={spotlight ? 'py-4 min-[1000px]:py-8' : 'py-4 xl:py-8'}
            >
              <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tags
              </h2>
              <div className="flex flex-wrap">
                {tags.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            </div>
          )}
          {(next || prev) && (
            <div
              className={
                spotlight
                  ? 'flex justify-between py-4 min-[1000px]:block min-[1000px]:space-y-8 min-[1000px]:py-8'
                  : 'flex justify-between py-4 xl:block xl:space-y-8 xl:py-8'
              }
            >
              {prev && (
                <div>
                  <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Previous Post
                  </h2>
                  <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                    <Link href={`/${prev.path}`}>{prev.title}</Link>
                  </div>
                </div>
              )}
              {next && (
                <div>
                  <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Next Post
                  </h2>
                  <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                    <Link href={`/${next.path}`}>{next.title}</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={spotlight ? 'pt-4 min-[1000px]:pt-8' : 'pt-4 xl:pt-8'}>
          <Link
            href={`/${basePath}`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="Back to the blog"
          >
            &larr; Back to the blog
          </Link>
        </div>
      </footer>
    </div>
  )
}
