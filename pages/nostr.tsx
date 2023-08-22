import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import Link from '@/components/Link'
import Image from '@/components/Image'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'nostr')
  const designTeam = allAuthors
    .filter((p) => p.design === true)
    .sort(() => Math.random() - 0.5)
  return { props: { page, designTeam } }
}

export default function Nostr({
  page,
  designTeam,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <MDXLayoutRenderer
        layout={page.layout || DEFAULT_LAYOUT}
        content={page}
        MDXComponents={MDXComponents}
      />
      {/* List all members of the design team */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 pb-8 pt-6 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div></div>
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 xl:col-span-2">
            Design Team
          </h1>
        </div>
        <div className="grid items-start space-y-2 xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="col-span-2 col-start-2 grid grid-cols-2 space-y-2 sm:gap-x-2 md:grid-cols-3 md:gap-x-8">
            {designTeam.map((member, i) => (
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
    </>
  )
}
