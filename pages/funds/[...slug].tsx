import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allFunds, allBlogs } from 'contentlayer/generated'
import type { Fund, Blog } from 'contentlayer/generated'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'
import PostList from '@/components/PostList'
import CustomLink from '@/components/Link'
import { PageActionButton, PageActionLink } from '@/components/PageAction'
import {
  getFundPrimaryTag,
  getRelatedBlogPostsForFund,
} from '@/utils/relatedPosts'
import { getFundDonationUrl } from '@/utils/funds'
import { faHeartPulse } from '@fortawesome/free-solid-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DEFAULT_LAYOUT = 'FundLayout'

export async function getStaticPaths() {
  return {
    paths: allFunds.map((f) => ({ params: { slug: f.slug.split('/') } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = (params.slug as string[]).join('/')
  const project = allFunds.find((f) => f.slug === slug)

  const sortedPosts = sortedBlogPost(allBlogs) as Blog[]
  const relatedPosts = getRelatedBlogPostsForFund(project, sortedPosts).slice(
    0,
    5
  )

  return {
    props: {
      project,
      relatedPosts: allCoreContent(relatedPosts),
    },
  }
}

export default function FundPage({
  project,
  relatedPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFund, setSelectedFund] = useState<Fund>()

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal() {
    setSelectedFund(project)
    setModalOpen(true)
  }
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
          <PageActionLink
            href="/newsletter#subscribe"
            aria-label="Read our Newsletter"
            title="Read our Newsletter"
            layout="mobileTextDesktopSquare"
          >
            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
            <span className="sm:hidden">Read our Newsletter</span>
          </PageActionLink>
          {project.heartbeat && (
            <PageActionLink
              href={project.heartbeat}
              aria-label={`View ${project.title} heartbeat`}
              title="View fund heartbeat"
              layout="mobileTextDesktopSquare"
            >
              <FontAwesomeIcon icon={faHeartPulse} className="h-4 w-4" />
              <span className="sm:hidden">View Heartbeat</span>
            </PageActionLink>
          )}
          <PageActionButton onClick={openPaymentModal}>
            Donate sats directly
          </PageActionButton>
          <PageActionLink
            href={getFundDonationUrl(project.slug)}
            variant="solid"
            className="sm:flex-1"
          >
            Donate monthly
          </PageActionLink>
        </aside>
      </div>
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        fund={selectedFund}
      />
      {relatedPosts.length > 0 && (
        <section className="mt-12 divide-y divide-gray-200 dark:divide-gray-700">
          <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
            <div></div>
            <h2 className="pb-8 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 xl:col-span-2">
              Related Announcements
            </h2>
          </div>
          <PostList posts={relatedPosts} rightAlignDate useProjectLayout />
          {getFundPrimaryTag(project) && (
            <div className="flex justify-end pt-4 text-base font-medium leading-6">
              <CustomLink
                href={`/tags/${getFundPrimaryTag(project)}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label="View all related announcements"
              >
                All Related Announcements &rarr;
              </CustomLink>
            </div>
          )}
        </section>
      )}
    </>
  )
}
