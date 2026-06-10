import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allProjects, allBlogs } from 'contentlayer/generated'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import { PageActionLink } from '@/components/PageAction'
import { getRelatedBlogPostsForProject } from '@/utils/relatedPosts'
import PostList from '@/components/PostList'
import { getFundDonationUrl, getFundLabel } from '@/utils/funds'
import { getHeartbeatUrl } from '@/utils/heartbeat'
import { faHeartPulse } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
      pageTheme: project?.fund === 'nostr' ? 'nostr' : 'default',
    },
  }
}

export default function ProjectPage({
  project,
  relatedPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const grantAnnouncements = relatedPosts.filter((post) =>
    (post.tags || []).some((tag) => tag.toLowerCase() === 'grants')
  )
  const furtherReading = relatedPosts.filter(
    (post) => !(post.tags || []).some((tag) => tag.toLowerCase() === 'grants')
  )

  return (
    <>
      <MDXLayoutRenderer
        layout={DEFAULT_LAYOUT}
        content={project}
        MDXComponents={MDXComponents}
      />
      <div className="mb-8 items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        <div></div>
        <aside className="bg-light flex flex-wrap items-center gap-4 rounded-xl py-4 xl:col-span-2">
          {project.announcementLink && (
            <PageActionLink
              variant="outlineMuted"
              href={project.announcementLink}
            >
              Read announcement
            </PageActionLink>
          )}
          {project.fund && (
            <PageActionLink
              variant="outlineMuted"
              href={getFundDonationUrl(project.fund)}
            >
              Donate to {getFundLabel(project.fund)}
            </PageActionLink>
          )}
          {(() => {
            const heartbeatUrl = getHeartbeatUrl(project.git)
            return heartbeatUrl ? (
              <PageActionLink
                variant="outlineMuted"
                href={heartbeatUrl}
                aria-label={`View ${project.title} heartbeat`}
                title="View project heartbeat"
                layout="mobileTextDesktopSquare"
              >
                <FontAwesomeIcon icon={faHeartPulse} className="h-4 w-4" />
                <span className="sm:hidden">View Heartbeat</span>
              </PageActionLink>
            ) : null
          })()}
          {project.donationLink && (
            <PageActionLink href={project.donationLink} variant="solid">
              Support directly
            </PageActionLink>
          )}
        </aside>
      </div>
      {grantAnnouncements.length > 0 && (
        <section
          id="announcements"
          className="mt-12 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
            <div></div>
            <h2 className="pb-8 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 xl:col-span-2">
              Grant Announcements
            </h2>
          </div>
          <PostList
            posts={grantAnnouncements}
            rightAlignDate
            useProjectLayout
          />
        </section>
      )}
      {furtherReading.length > 0 && (
        <section
          id="further-reading"
          className="mt-12 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
            <div></div>
            <h2 className="pb-8 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 xl:col-span-2">
              Further Reading
            </h2>
          </div>
          <PostList posts={furtherReading} rightAlignDate useProjectLayout />
        </section>
      )}
    </>
  )
}
