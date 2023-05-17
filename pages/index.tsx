import Link from '@/components/Link'
import Image from '@/components/Image'
import { useEffect, useState } from 'react'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { InferGetStaticPropsType } from 'next'
import { NewsletterForm } from 'pliny/ui/NewsletterForm'
import { allBlogs } from 'contentlayer/generated'
import { getAllPosts, getPostBySlug } from '../utils/md'
import type { Blog } from 'contentlayer/generated'
import phoenix from '/public/static/images/phoenix.png'
import { useRouter } from 'next/router'
import { ProjectItem } from '../utils/types'
import PaymentModal from '../components/PaymentModal'

const MAX_DISPLAY = 5

export const getStaticProps = async () => {
  const sortedPosts = sortedBlogPost(allBlogs) as Blog[]
  const posts = allCoreContent(sortedPosts)

  const projects = getAllPosts()

  const generalFund = getPostBySlug("general_fund", true);
  const opsFund = getPostBySlug("opensats_operations_budget", true);

  return { props: { posts, projects, generalFund, opsFund } }
}

export default function Home({ posts, projects, generalFund, opsFund }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [modalOpen, setModalOpen] = useState(false)

  const router = useRouter()

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: ProjectItem) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  function openGeneralFundModal() {
    openPaymentModal(generalFund)
  }

  function openopsFundModal() {
    openPaymentModal(opsFund)
  }
  
  useEffect(() => {
    if (router.isReady) {
      console.log(router.query);
      if (router.query.donate === "ops") {
        openPaymentModal(opsFund)
      }

    }
  }, [router.isReady])
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <section className="flex py-8 items-center">
        <div className="space-y-8 basis-2/3 max-w-4xl">
          <h1>
            Support contributors to Bitcoin and other free and open-source projects
          </h1>
          <p>
            We help you find and support open-source Bitcoin projects—helping create a better tomorrow, today.
          </p>
          <div className='flex flex-wrap'>
            <div>
              <button role={'button'} onClick={openGeneralFundModal} className='mr-2 mb-2 block bg-orange-500 text-white hover:bg-orange-500 hover:text-white dark:bg-white dark:text-black dark:hover:bg-orange-500 font-semibold py-2 px-4 hover:border-transparent rounded'>
                Donate to General Fund
              </button>
            </div>
            <div>
              <button role={'button'} onClick={openopsFundModal} className='block bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white dark:bg-white dark:text-black dark:hover:bg-orange-500 font-semibold py-2 px-4 border border-orange-500 hover:border-transparent rounded'>
                Donate to Operations Budget
              </button>
            </div>
          </div>
          <p> 
            Are you an open-source contributor?{' '}
            <Link href="/apply" className='underline'>
              Apply for your project to be listed.
            </Link>
          </p>
        </div>
        <div className="flex-1 flex justify-center">
          <Image width={388} height={388} src={phoenix} alt="Phoenix" />
        </div>
      </section>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Latest
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}
