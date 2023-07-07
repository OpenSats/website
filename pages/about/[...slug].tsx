import { InferGetStaticPropsType } from 'next'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'AuthorLayout'

export async function getStaticPaths() {
  return {
    paths: allAuthors.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = (params.slug as string[]).join('/')
  const author = allAuthors.find((p) => p.slug === slug)
  return { props: { author } }
}

export default function About({
  author,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <MDXLayoutRenderer
      layout={DEFAULT_LAYOUT}
      content={author}
      MDXComponents={MDXComponents}
    />
  )
}
