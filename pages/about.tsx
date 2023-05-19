// import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import Image from '@/components/Image'
import Link from '@/components/Link'

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
    <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
    {board.map((member, i) => 
      (
        <div className="flex flex-col items-center space-x-2 pt-8">
          <Link href={`/team/${member.slug}`}>
            <Image
              src={member.avatar}
              alt="avatar"
              width={192}
              height={192}
              className="h-48 w-48 rounded-full"
            />
          </Link>
        </div>
      ))}
      </div>
    </>
  )
}
