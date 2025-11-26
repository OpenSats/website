import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allProjects, allBlogs } from 'contentlayer/generated'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import { getRelatedBlogPostsForProject } from '@/utils/relatedPosts'
import PostList from '@/components/PostList'

const DEFAULT_LAYOUT = 'ProjectLayout'

export async function getStaticPaths() {
  return {
    paths: allProjects.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = (params.slug as string[]).join('/')
  const project = allProjects.find((p) => p.slug === slug)

  // Find blog posts that mention this project
  const sortedPosts = sortedBlogPost(allBlogs) as Blog[]
  const relatedPosts = getRelatedBlogPostsForProject(project, sortedPosts)

  return {
    props: {
      project,
      relatedPosts: allCoreContent(relatedPosts),
    },
  }
}

export default function ProjectPage({
  project,
  relatedPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <MDXLayoutRenderer
        layout={DEFAULT_LAYOUT}
        content={project}
        MDXComponents={MDXComponents}
      />
      <aside className="bg-light mb-8 flex min-w-[20rem] items-center justify-between gap-4 rounded-xl p-4 lg:flex-col lg:items-start">
        {project.donationLink && (
          <CustomLink
            href={project.donationLink}
            className="block rounded border border-stone-800 bg-stone-800 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500"
          >
            {project.donationLink.includes('geyser')
              ? 'Donate via Geyser'
              : project.donationLink.includes('opencollective')
              ? 'Donate via OpenCollective'
              : 'Donate directly'}
          </CustomLink>
        )}
      </aside>
      {relatedPosts.length > 0 && (
        <section className="mt-12 divide-y divide-gray-200 dark:divide-gray-700">
          <h2 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 pb-8">
            Related Blog Posts
          </h2>
          <PostList posts={relatedPosts} />
        </section>
      )}
    </>
  )
}
