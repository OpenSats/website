import { InferGetStaticPropsType } from 'next'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'AuthorLayout'

export const getStaticProps = async () => {
  const openSats = allAuthors.find((p) => p.slug === 'default')
  const board = allAuthors
    .filter((p) => p.board === true)
    .sort(() => Math.random() - 0.5)
  const ops = allAuthors.filter((p) => p.ops === true)
  return { props: { openSats, board, ops } }
}

export default function About({
  openSats,
  board,
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
