import { InferGetStaticPropsType } from 'next'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import Board from '@/components/Board'
import Credits from '@/components/Supporters'
import Volunteers from '@/components/Volunteers'

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
      {/* List all members of the board */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 pb-8 pt-6 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div></div>
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 xl:col-span-2">
            Board of Directors
          </h1>
        </div>
        <div className="grid items-start space-y-2 xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <Board />
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 pb-8 pt-6 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div></div>
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 xl:col-span-2">
            Volunteers
          </h1>
        </div>
        <div className="grid items-start space-y-2 xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <Volunteers />
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 pb-8 pt-6 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div></div>
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 xl:col-span-2">
            Supporters
          </h1>
        </div>
        <div className="grid items-start space-y-2 xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <Credits />
        </div>
      </div>
    </>
  )
}
