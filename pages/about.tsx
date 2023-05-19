// import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'AuthorLayout'

export const getStaticProps = async () => {
  const openSats = allAuthors.find((p) => p.slug === 'default')
  const board = allAuthors.filter((p) => p.board === true)
  return { props: { openSats, board } }
}

export default function About({ openSats, board }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
    <MDXLayoutRenderer
      layout={openSats.layout || DEFAULT_LAYOUT}
      content={openSats}
      MDXComponents={MDXComponents}
    />
    {/* List all members of the board */}
    {board.map((member, i) => 
      (
        <MDXLayoutRenderer
          layout={member.layout || DEFAULT_LAYOUT}
          content={member}
          MDXComponents={MDXComponents} />
      ))}
    </>
  )
}
