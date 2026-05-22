import { useState, ReactNode } from 'react'
import { Comments } from 'pliny/comments'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Link from '@/components/Link'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import {
  discussUrl,
  editUrl,
  postGridClasses,
} from '@/components/post/postShared'

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
      className={`grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0 ${postGridClasses}`}
    >
      <dl className="pb-10 pt-6 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
        <dt className="sr-only">Authors</dt>
        <dd>
          <ul
            className={`flex flex-wrap gap-4 xl:block xl:space-x-0 xl:space-y-8 ${
              spotlight ? 'justify-start' : 'justify-center sm:space-x-12'
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
      <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
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
        <div className="divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 xl:col-start-1 xl:row-start-2 xl:divide-y">
          {tags && (
            <div className="py-4 xl:py-8">
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
            <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
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
        <div className="pt-4 xl:pt-8">
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
