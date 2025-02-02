import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'nostr')
  return { props: { page } }
}

export default function Nostr({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <MDXLayoutRenderer
        layout={page.layout || DEFAULT_LAYOUT}
        content={page}
        MDXComponents={MDXComponents}
      />
    </>
  )
}
