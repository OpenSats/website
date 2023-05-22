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
              Website Listing
            </h2>
            <p className="mb-8">
              Any FOSS project that is aligned with the OpenSats mission is free
              to submit an application to be listed on the OpenSats website.
              Donors may recommend their gifts be directed to specific projects
              on this list. If you are helping Bitcoin and FOSS, please submit
              an application to be listed on our site.
            </p>
            <Link
              href="/apply/to-be-listed"
              className="bg-transparent no-underline text-orange-500 hover:text-black dark:hover:text-white font-semibold py-2 px-4 border border-orange-500 rounded"
            >
              Apply to be listed on OpenSats.org
            </Link>
            <h2 className="mb-4 text-xl font-bold leading-normal md:text-2xl">
              General Grant
            </h2>
            <p className="mb-8">
              General grants are funded by donations to the OpenSats General
              Fund and will be distributed quarterly by our board. We evaluate
              and assess all applications to make sure grants are awarded to
              high impact projects in the Bitcoin space. 
            </p>
            <Link
              href="/apply/grant"
              className="bg-transparent no-underline text-orange-500 hover:text-black dark:hover:text-white font-semibold py-2 px-4 border border-orange-500 rounded"
            >
              Apply for an OpenSats General Grant
            </Link>
            <h2 className="mb-4 text-xl font-bold leading-normal md:text-2xl">
              Long-Term Support
            </h2>
            <p className="mb-8">
              We have a limited number of long-term support grants available for
              projects that are critical to the Bitcoin ecosystem. These grants
              are geared towards developers and maintainers of Bitcoin Core and
              similar.
            </p>
            <Link
              href="/apply/lts"
              className="bg-transparent no-underline text-orange-500 hover:text-black dark:hover:text-white font-semibold py-2 px-4 border border-orange-500 rounded"
            >
              Apply for an OpenSats LTS Grant
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
