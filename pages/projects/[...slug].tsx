import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allProjects, allBlogs } from 'contentlayer/generated'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import { getRelatedBlogPostsForProject } from '@/utils/relatedPosts'
import PostList from '@/components/PostList'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

const DEFAULT_LAYOUT = 'ProjectLayout'

const FUND_DESIGNATION_IDS: Record<string, string> = {
  nostr: 'ENWRA6YZ',
  ops: 'ELL6P2J6',
}

const FUND_LABELS: Record<string, string> = {
  general: 'General Fund',
  nostr: 'The Nostr Fund',
  ops: 'Operations Budget',
}

function getFundDonationUrl(fund: string): string {
  const designationId = FUND_DESIGNATION_IDS[fund]
  return designationId
    ? `${MONTHLY_DONATION_URL}?designationId=${designationId}`
    : MONTHLY_DONATION_URL
}

function getFundLabel(fund: string): string {
  return FUND_LABELS[fund] || fund
}

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
      <div className="mb-8 items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        <div></div>
        <aside className="bg-light flex flex-wrap items-center gap-4 rounded-xl px-4 py-4 xl:col-span-2 xl:px-0">
          {project.announcementLink && (
            <CustomLink
              href={project.announcementLink}
              className="block rounded border border-stone-800 bg-transparent px-4 py-2 font-semibold text-stone-800 hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:border-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-black"
            >
              Read announcement
            </CustomLink>
          )}
          {project.fund && (
            <CustomLink
              href={getFundDonationUrl(project.fund)}
              className="block rounded border border-stone-800 bg-transparent px-4 py-2 font-semibold text-stone-800 hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:border-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-black"
            >
              Donate to {getFundLabel(project.fund)}
            </CustomLink>
          )}
          {project.donationLink && (
            <CustomLink
              href={project.donationLink}
              className="block rounded border border-stone-800 bg-stone-800 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500"
            >
              {project.donationLink.includes('geyser')
                ? 'Support via Geyser'
                : project.donationLink.includes('opencollective')
                ? 'Support via OpenCollective'
                : 'Support directly'}
            </CustomLink>
          )}
        </aside>
      </div>
      {relatedPosts.length > 0 && (
        <section
          id="announcements"
          className="mt-12 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
            <div></div>
            <h2 className="pb-8 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 xl:col-span-2">
              Further Reading
            </h2>
          </div>
          <PostList posts={relatedPosts} rightAlignDate useProjectLayout />
        </section>
      )}
    </>
  )
}
