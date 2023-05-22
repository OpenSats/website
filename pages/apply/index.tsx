import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import Image from '@/components/Image'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const apply = allPages.find((p) => p.slug === 'apply')
  return { props: { apply  } }
}

export default function Apply({ apply }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title="Apply to one of OpenSats' programs" description="TODO" />
      <MDXLayoutRenderer
        layout={DEFAULT_LAYOUT}
        content={apply}
        MDXComponents={MDXComponents}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 pt-6 pb-8 md:space-y-5">
          <div></div>
          <h1 className="text-3xl xl:col-span-2 font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Our Programs
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center space-x-2 pt-8">
            <Image
              src='/static/images/avatar.png'
              alt="avatar"
              width={210}
              height={210}
              className="h-48 w-48"
            />
          </div>
          <div className="prose max-w-none pt-8 pb-8 dark:prose-dark xl:col-span-2">
            <h2 className="mb-4 text-xl font-bold leading-normal md:text-2xl">
              Project Listing
            </h2>
            <p className="mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
              minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <Link
              href="/apply/to-be-listed"
              className="focus:shadow-outline-orange inline rounded-lg border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium leading-5 text-white shadow transition-colors duration-150 hover:bg-orange-700 focus:outline-none dark:hover:bg-orange-500"
            >
              Apply to be listed on OpenSats.org
            </Link>
            <h2 className="mb-4 text-xl font-bold leading-normal md:text-2xl">
              General Grant
            </h2>
            <p className="mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
              minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <Link
              href="/apply/legacy"
              className="focus:shadow-outline-orange inline rounded-lg border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium leading-5 text-white shadow transition-colors duration-150 hover:bg-orange-700 focus:outline-none dark:hover:bg-orange-500"
            >
              Apply for an OpenSats General Grant
            </Link>
            <h2 className="mb-4 text-xl font-bold leading-normal md:text-2xl">
              Long-Term Support
            </h2>
            <p className="mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
              minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <Link
              href="/apply/lts"
              className="focus:shadow-outline-orange inline rounded-lg border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium leading-5 text-white shadow transition-colors duration-150 hover:bg-orange-700 focus:outline-none dark:hover:bg-orange-500"
            >
              Apply for an OpenSats LTS Grant
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
