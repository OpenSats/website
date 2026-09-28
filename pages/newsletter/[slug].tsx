import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allNewsletters } from 'contentlayer/generated'
import type { Newsletter } from 'contentlayer/generated'

const DEFAULT_LAYOUT = 'NewsletterLayout'

export async function getStaticPaths() {
  const slugs = new Set<string>()
  for (const n of allNewsletters) {
    slugs.add(n.slug)
  }
  return {
    paths: Array.from(slugs).map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = (params.slug as string).toLowerCase()
  const issue = allNewsletters.find(
    (n) => n.slug.toLowerCase() === slug
  ) as Newsletter
  if (!issue) return { notFound: true }
  if (params.slug !== issue.slug) {
    return {
      redirect: { destination: `/newsletter/${issue.slug}`, permanent: true },
    }
  }
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
