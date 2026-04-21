import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allTopics, allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { getRelatedBlogPostsForTopic } from '@/utils/relatedPosts'
import PostList from '@/components/PostList'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'

const DEFAULT_LAYOUT = 'TopicLayout'

export async function getStaticPaths() {
  return {
    paths: allTopics.map((t) => ({ params: { slug: t.slug } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const topic = allTopics.find((t) => t.slug === params.slug)
  const sortedPosts = sortedBlogPost(allBlogs) as Blog[]
  const relatedPosts = getRelatedBlogPostsForTopic(topic, sortedPosts)
  return {
    props: {
      topic,
      relatedPosts: allCoreContent(relatedPosts),
    },
  }
}

export default function TopicPage({
  topic,
  relatedPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const repo = siteMetadata.siteRepo.replace(/\/$/, '')
  const editUrl = `${repo}/edit/main/data/${topic.filePath}`
  return (
    <>
      <MDXLayoutRenderer
        layout={DEFAULT_LAYOUT}
        content={topic}
        MDXComponents={MDXComponents}
      />
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
          Propose edit on GitHub
        </Link>
      </nav>
      {relatedPosts.length > 0 && (
        <section
          id="related-posts"
          className="mt-12 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
            <div></div>
            <h2 className="pb-8 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 xl:col-span-2">
              Related Posts
            </h2>
          </div>
          <PostList posts={relatedPosts} rightAlignDate useProjectLayout />
        </section>
      )}
    </>
  )
}
