import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'canary')
  return { props: { page: page } }
}

export default function Canary({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <MDXLayoutRenderer
      layout={page.layout || DEFAULT_LAYOUT}
      content={page}
      MDXComponents={MDXComponents}
    />
  )
}
