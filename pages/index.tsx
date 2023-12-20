import Link from '@/components/Link'
import { useEffect, useState } from 'react'
import ProjectList from '../components/ProjectList'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { InferGetStaticPropsType } from 'next'
import { NewsletterForm } from 'pliny/ui/NewsletterForm'
import { allBlogs, allProjects } from 'contentlayer/generated'
import type { Blog, Project } from 'contentlayer/generated'
import { useRouter } from 'next/router'
import PaymentModal from '../components/PaymentModal'
import { isNotOpenSatsProject } from './projects'
import Typing from '@/components/Typing'
import CustomLink from '@/components/Link'

const MAX_DISPLAY = 2

export const getStaticProps = async () => {
  const sortedPosts = sortedBlogPost(allBlogs) as Blog[]
  const posts = allCoreContent(sortedPosts)

  const projects = allProjects
    .filter(isNotOpenSatsProject)
    .sort(() => 0.5 - Math.random())

  const generalFund = allProjects.find((p) => p.slug === 'general_fund')
  const opsFund = allProjects.find(
    (p) => p.slug === 'opensats_operations_budget'
  )

  return { props: { posts, projects, generalFund, opsFund } }
}

export default function Home({
  posts,
  projects,
  generalFund,
  opsFund,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [modalOpen, setModalOpen] = useState(false)

  const router = useRouter()

  const [selectedProject, setSelectedProject] = useState<Project>()

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: Project) {
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
      console.log(router.query)
      if (router.query.donate === 'ops') {
        openPaymentModal(opsFund)
      }
    }
  }, [router.isReady])
  return (
    <>
      <PageSEO
        title={siteMetadata.title}
        description={siteMetadata.description}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-4 md:pb-8">
          <h1 className="py-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Support <Typing />
          </h1>
          <p className="text-xl leading-7 text-gray-500 dark:text-gray-400">
            Help us to provide sustainable funding for free and open-source
            contributors working on freedom tech and projects that help bitcoin
            flourish.
          </p>
          <div className="flex flex-wrap py-4">
            <div className="w-full md:w-1/2">
              <button
                onClick={openGeneralFundModal}
                className="mb-2 mr-2 w-full rounded bg-orange-500 px-4 text-xl font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-black dark:text-black dark:hover:text-white md:max-w-[98%]"
              >
                Donate to General Fund
              </button>
            </div>
            <div className="w-full md:w-1/2">
              <button
                onClick={openopsFundModal}
                className="block w-full rounded border border-orange-500 bg-transparent px-4 text-xl font-semibold text-orange-500 hover:border-transparent hover:bg-orange-500 hover:text-black dark:hover:text-white"
              >
                Donate to Operations Budget
              </button>
            </div>
          </div>
          <p className="text-md leading-7 text-gray-500 dark:text-gray-400">
            We are a 501(c)(3) public charity. All donations are tax deductible.
          </p>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-16 md:space-y-5 xl:pt-12">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Why OpenSats?
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            We believe that free and open-source software in general, and
            bitcoin in particular, is essential to the future of the internet
            and the world.
          </p>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            We don't want any one person to have control over funding decisions,
            so we created a transparent, public-facing, and accountable{' '}
            <CustomLink href="/about#board-of-directors" className="underline">
              nine-person board
            </CustomLink>{' '}
            to make all organizational decisions.
          </p>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            We rely on donations to fund our operations and the projects we
            support. Unlike most charities, we don't take a cut from donations
            to fund ourselves. Consequently, we have to fund our operations
            separately. If you like what we are doing please consider donating
            to our{' '}
            <CustomLink
              href="/projects/opensats_operations_budget"
              className="underline"
            >
              Operations Budget
            </CustomLink>
            .
          </p>
          <div className="flex justify-end text-base font-medium leading-6">
            <Link
              href="/mission"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="Our Mission"
            >
              Our Mission &rarr;
            </Link>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-2 pt-8 md:space-y-5 xl:pt-12">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Stay Updated
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Read the latest news from OpenSats:
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
                        <time dateTime={date}>
                          {formatDate(date, siteMetadata.locale)}
                        </time>
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
      <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
        You can also find us on{' '}
        <CustomLink
          href="https://njump.me/npub10pensatlcfwktnvjjw2dtem38n6rvw8g6fv73h84cuacxn4c28eqyfn34f"
          className="underline"
        >
          nostr
        </CustomLink>
        .
      </p>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end pb-8 text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="xl:pt-18 space-y-2 pb-8 pt-8 md:space-y-5 ">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Apply for Funding
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Are you an open-source contributor? Do you align with{' '}
            <CustomLink href="/mission" className="underline">
              our mission
            </CustomLink>
            ? Are you working on Bitcoin, nostr, or freedom tech in general?{' '}
            <CustomLink href="/apply" className="underline">
              Apply for funding!
            </CustomLink>
          </p>
          <div className="flex justify-end text-base font-medium leading-6">
            <Link
              href="/apply#criteria"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="Learn More"
            >
              Learn More &rarr;
            </Link>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="xl:pt-18 space-y-2 pt-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Explore Projects
          </h1>
          <p className="pt-2 text-lg leading-7 text-gray-500 dark:text-gray-400">
            Browse through and{' '}
            <CustomLink href="/projects" className="underline">
              directly support projects
            </CustomLink>{' '}
            selected by OpenSats.
          </p>
          <ProjectList
            projects={projects}
            openPaymentModal={openPaymentModal}
          />
          <div className="flex justify-end pt-4 text-base font-medium leading-6">
            <Link
              href="/projects"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="View All Projects"
            >
              View All Projects &rarr;
            </Link>
          </div>
        </div>
      </div>
      {siteMetadata.newsletter && siteMetadata.newsletter.provider && (
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
