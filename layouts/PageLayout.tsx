import { ReactNode } from 'react'
import type { Pages } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import Image from '@/components/Image'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<Pages>
}

export default function PageLayout({ children, content }: Props) {
  const { title, summary, image, layout } = content

  return (
    <>
      <PageSEO title={`${title} - OpenSats`} description={`${summary}`} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 pt-6 pb-8 md:space-y-5">
          <div></div>
          <h1 className="text-3xl xl:col-span-2 font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center space-x-2 pt-8 hidden xl:block">
            <Image
              src={image}
              alt="avatar"
              width={210}
              height={210}
              className="h-48 w-48"
            />
          </div>
          <div className="prose max-w-none pt-8 pb-8 dark:prose-dark xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
