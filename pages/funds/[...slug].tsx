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
import { getRelatedBlogPostsForFund } from '@/utils/relatedPosts'
import { MONTHLY_DONATION_URL } from '@/utils/constants'
import { faHeartPulse } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DEFAULT_LAYOUT = 'ProjectLayout'

const FUND_DESIGNATION_IDS: Record<string, string> = {
  nostr: 'ENWRA6YZ',
  ops: 'ELL6P2J6',
}

function getFundDonationUrl(fund: string): string {
  const designationId = FUND_DESIGNATION_IDS[fund]
  return designationId
    ? `${MONTHLY_DONATION_URL}?designationId=${designationId}`
    : MONTHLY_DONATION_URL
}

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
          <CustomLink
            href="/newsletter"
            className="block w-full rounded border border-stone-800 bg-transparent px-4 py-2 text-center font-semibold text-stone-800 hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:border-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-black sm:w-auto"
          >
            Subscribe to Newsletter
          </CustomLink>
          <button
            onClick={openPaymentModal}
            className="block w-full rounded border border-stone-800 bg-transparent px-4 py-2 text-center font-semibold text-stone-800 hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:border-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-black sm:w-auto"
          >
            Donate sats directly
          </button>
          {project.heartbeat && (
            <CustomLink
              href={project.heartbeat}
              aria-label={`View ${project.title} heartbeat`}
              title="View fund heartbeat"
              className="inline-flex w-full flex-none items-center justify-center gap-2 rounded border border-stone-800 bg-transparent px-4 py-2 font-semibold text-stone-800 hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:border-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-black sm:h-[42px] sm:w-[42px] sm:gap-0 sm:p-0 sm:leading-none"
            >
              <FontAwesomeIcon icon={faHeartPulse} className="h-4 w-4" />
              <span className="sm:hidden">View Heartbeat</span>
            </CustomLink>
          )}
          <CustomLink
            href={getFundDonationUrl(project.slug)}
            className="block w-full rounded border border-stone-800 bg-stone-800 px-4 py-2 text-center font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500 sm:w-auto"
          >
            Donate monthly
          </CustomLink>
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
        </section>
      )}
    </>
  )
}
