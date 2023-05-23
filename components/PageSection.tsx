import { ReactNode } from 'react'
import Image from '@/components/Image'
import PageHeading from '@/components/PageHeading'

interface Props {
  children: ReactNode
  title: String,
  image: string
}

export default function PageSection({ title, image, children }: Props) {

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <PageHeading title={title}>
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
      </PageHeading>
    </div>
  )
}
