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
          applicant. Refer to our{' '}
          <CustomLink href="/faq/application">Application FAQ</CustomLink> to
          find answers to common questions.
        </p>
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
          href="/apply/grant"
          className="rounded border border-orange-500 bg-transparent px-4 py-2 font-semibold text-orange-500 no-underline hover:text-black dark:hover:text-white"
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
          href="/apply/lts"
          className="rounded border border-orange-500 bg-transparent px-4 py-2 font-semibold text-orange-500 no-underline hover:text-black dark:hover:text-white"
        >
          Apply for an OpenSats LTS Grant
        </Link>
      </PageSection>
    </>
  )
}
