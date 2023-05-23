import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import Image from '@/components/Image'
import PageSection from '@/components/PageSection'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const apply = allPages.find((p) => p.slug === 'apply')
  return { props: { apply } }
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
      <PageSection title='Our Programs' image='/static/images/avatar.png'>
        <p>
          All our programs are open to applicants worldwide. We are global and nym-friendly.
        </p>
        <p>
          OpenSats does not discriminate in its grant selection process with
          applicants, whether internal or external, because of race, creed,
          color, age, national origin, ancestry, religion, gender, sexual
          orientation, gender identity, disability, genetic information,
          veteran status, military status, application for military service
          or any other class per local, state or federal law.
        </p>
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
      </PageSection>
    </>
  )
}