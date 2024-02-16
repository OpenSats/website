import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import PageSection from '@/components/PageSection'
import CustomLink from '@/components/Link'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const apply = allPages.find((p) => p.slug === 'apply')
  return { props: { apply } }
}

export default function Apply({
  apply,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title="Apply to One of Opensats' Grant Programs"
        description="Global. Nym-friendly. Flexible."
      />
      <MDXLayoutRenderer
        layout={DEFAULT_LAYOUT}
        content={apply}
        MDXComponents={MDXComponents}
      />
      <PageSection title="Our Programs" image="/static/images/avatar.png">
        <p>
          All our programs are open to applicants worldwide. We are global and
          nym-friendly.
        </p>
        <p>
          OpenSats does not discriminate in its{' '}
          <CustomLink href="/selection">grant selection process</CustomLink>{' '}
          applicants, whether internal or external, because of race, creed,
          color, age, national origin, ancestry, religion, gender, sexual
          orientation, gender identity, disability, genetic information, veteran
          status, military status, application for military service or any other
          class per local, state or federal law.
        </p>
        <p>
          Applications should be well written, informative, and concise. A great
          application will fit comfortably on one page while containing all
          information that is required to assess and judge the project or
          applicant.
        </p>
        <div
          className="rounded-b border-t-4 border-orange-500 bg-yellow-100 px-4 py-3 text-yellow-900 shadow-md"
          role="alert"
        >
          <div className="flex">
            <div className="py-1">
              <svg
                className="mr-4 h-6 w-6 fill-current text-orange-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Applications are currently closed!</p>
              <p className="text-sm">
                Applications are temporarily closed for some well-needed spring
                cleaning. Please have a look at{' '}
                <Link href="/blog/2023-year-in-review">our last report</Link> to
                see what kind of projects we support and get familiar with our{' '}
                <Link href="/selection">grant selection process</Link> if you
                want to prepare a submission. We will re-open applications again
                soon. (Two weeks&trade;)
              </p>
            </div>
          </div>
        </div>
        <h2 className="mb-4 text-xl font-bold leading-normal md:text-2xl">
          General Grant
        </h2>
        <p className="mb-8">
          General grants are funded by donations to the OpenSats General Fund
          and will be distributed periodically by our board. We evaluate and
          assess all applications to make sure grants are awarded to high impact
          projects in the Bitcoin space.
        </p>
        <Link
          href="#/apply/grant"
          className="disabled rounded border border-orange-500 bg-transparent px-4 py-2 font-semibold text-orange-500 no-underline hover:text-black dark:hover:text-white"
        >
          Apply for an OpenSats General Grant
        </Link>
        <h2 className="mb-4 text-xl font-bold leading-normal md:text-2xl">
          Long-Term Support
        </h2>
        <p className="mb-8">
          We have a limited number of long-term support grants available for
          projects that are critical to the Bitcoin ecosystem. These grants are
          geared towards developers and maintainers of Bitcoin Core and similar.
        </p>
        <Link
          href="#/apply/lts"
          className="disabled rounded border border-orange-500 bg-transparent px-4 py-2 font-semibold text-orange-500 no-underline hover:text-black dark:hover:text-white"
        >
          Apply for an OpenSats LTS Grant
        </Link>
      </PageSection>
    </>
  )
}
