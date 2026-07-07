import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import Link from '@/components/Link'
import SpotlightCard from '@/components/SpotlightCard'
import { kebabCase } from 'pliny/utils/kebabCase'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { InferGetStaticPropsType } from 'next'
import { allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'

export const getStaticProps = async () => {
  const posts = allCoreContent(
    sortedBlogPost(
      allBlogs.filter(
        (post) =>
          post.draft !== true &&
          post.tags.map((tag) => kebabCase(tag)).includes('spotlight')
      )
    ) as Blog[]
  )
  return { props: { posts } }
}

export default function Spotlight({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [featured, ...rest] = posts

  return (
    <>
      <PageSEO
        title={`Developer Spotlights - ${siteMetadata.title}`}
        description="Meet the developers OpenSats supports and the open-source work they are building."
      />
      <div className="space-y-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
          Developer Spotlights
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Get to know the developers we support and the open-source projects
          they pour their days into.
        </p>
      </div>

      {featured && (
        <div className="pb-10">
          <SpotlightCard post={featured} featured />
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid gap-8 pb-10 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((post) => (
            <SpotlightCard key={post.path} post={post} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-end gap-4 pt-8 text-base font-medium leading-6">
        <Link
          href="/donate"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          aria-label="Donate to OpenSats"
        >
          Help fund developers like these &rarr;
        </Link>
        <Link
          href="/apply"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          aria-label="Apply for funding"
        >
          Could you be next? Apply for funding &rarr;
        </Link>
      </div>
    </>
  )
}
