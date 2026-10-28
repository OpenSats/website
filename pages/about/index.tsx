import { InferGetStaticPropsType } from 'next'
import { allAuthors } from 'content-collections'
import { MDXLayoutRenderer } from 'pliny/mdx-components.js'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'AuthorLayout'

export const getStaticProps = async () => {
  const openSats = allAuthors.find((p) => p.slug === 'default')
  return { props: { openSats } }
}

export default function About({
  openSats,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <MDXLayoutRenderer
        layout={openSats.layout || DEFAULT_LAYOUT}
        content={openSats}
        MDXComponents={MDXComponents}
      />
    </>
  )
}
