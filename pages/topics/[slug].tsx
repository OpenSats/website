import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allTopics } from 'contentlayer/generated'
import type { Topic } from 'contentlayer/generated'

const DEFAULT_LAYOUT = 'TopicLayout'

function sortTopics(topics: Topic[]): Topic[] {
  return [...topics].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  )
}

export async function getStaticPaths() {
  return {
    paths: allTopics.map((t) => ({ params: { slug: t.slug } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const sorted = sortTopics(allTopics as Topic[])
  const index = sorted.findIndex((t) => t.slug === params.slug)
  const topic = sorted[index]
  const prevTopic = sorted[index - 1]
  const nextTopic = sorted[index + 1]
  const prev = prevTopic
    ? { slug: prevTopic.slug, title: prevTopic.title }
    : null
  const next = nextTopic
    ? { slug: nextTopic.slug, title: nextTopic.title }
    : null

  return {
    props: {
      topic,
      prev,
      next,
    },
  }
}

export default function TopicPage({
  topic,
  prev,
  next,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <MDXLayoutRenderer
      layout={DEFAULT_LAYOUT}
      content={topic}
      MDXComponents={MDXComponents}
      prev={prev}
      next={next}
    />
  )
}
