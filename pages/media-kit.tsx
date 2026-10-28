import { InferGetStaticPropsType } from 'next'
import { allPages } from 'content-collections'
import { MDXLayoutRenderer } from 'pliny/mdx-components.js'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'media-kit')
  return { props: { page: page } }
}

export default function MediaKitPage({
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
