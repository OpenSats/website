import { InferGetStaticPropsType } from 'next'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import Image from '@/components/Image'
import Link from '@/components/Link'
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
  ops,
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
          <div className="col-span-2 col-start-2 grid grid-cols-2 space-y-2 sm:gap-x-2 md:grid-cols-3 md:gap-x-8">
            {board.map((member, i) => (
              <div className="items-left flex flex-col space-x-2 pt-8" key={i}>
                <Link href={`/about/${member.slug}`}>
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={120}
                    height={120}
                    className="h-36 w-36 rounded-full"
                  />
                </Link>
              </div>
            ))}
          </div>
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
