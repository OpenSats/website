import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allNewsletters } from 'contentlayer/generated'
import type { Newsletter } from 'contentlayer/generated'

const DEFAULT_LAYOUT = 'NewsletterLayout'

export async function getStaticPaths() {
  return {
    paths: allNewsletters.map((n) => ({ params: { slug: n.slug } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = params.slug as string
  const issue = allNewsletters.find((n) => n.slug === slug) as Newsletter
  return {
    props: {
      issue,
    },
  }
}

export default function NewsletterIssuePage({
  issue,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <MDXLayoutRenderer
      layout={issue.layout || DEFAULT_LAYOUT}
      content={issue}
      MDXComponents={MDXComponents}
    />
  )
}
