import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allFunds, allBlogs } from 'contentlayer/generated'
import type { Fund, Blog } from 'contentlayer/generated'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'
import PostList from '@/components/PostList'
import { getRelatedBlogPostsForFund } from '@/utils/relatedPosts'

const DEFAULT_LAYOUT = 'ProjectLayout'

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
  const relatedPosts = getRelatedBlogPostsForFund(project, sortedPosts)

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
      <aside className="bg-light mb-8 flex min-w-[20rem] items-center justify-between gap-4 rounded-xl p-4 lg:flex-col lg:items-start">
        <button
          onClick={openPaymentModal}
          className="block rounded border border-stone-800 bg-stone-800 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500"
        >
          Donate Now!
        </button>
      </aside>
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
