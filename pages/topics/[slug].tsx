import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allTopics } from 'contentlayer/generated'

const DEFAULT_LAYOUT = 'TopicLayout'

export async function getStaticPaths() {
  return {
    paths: allTopics.map((t) => ({ params: { slug: t.slug } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const topic = allTopics.find((t) => t.slug === params.slug)
  return { props: { topic } }
}

export default function TopicPage({
  topic,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <MDXLayoutRenderer
      layout={DEFAULT_LAYOUT}
      content={topic}
      MDXComponents={MDXComponents}
    />
  )
}
