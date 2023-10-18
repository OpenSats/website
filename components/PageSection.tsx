import { ReactNode } from 'react'
import Image from '@/components/Image'
import PageHeading from '@/components/PageHeading'
import SocialIcon from '@/components/social-icons'

interface Props {
  children: ReactNode
  title: string
  image: string
  website?: string
  git?: string
  twitter?: string
}

export default function PageSection({
  title,
  image,
  website,
  git,
  twitter,
  children,
}: Props) {
  let twitter_url
  if (twitter) {
    twitter_url = `https://twitter.com/${twitter}`
  }
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <PageHeading title={title}>
        <div className="flex flex-col items-center space-x-2 pt-8 xl:block">
          <Image
            src={image}
            alt="avatar"
            width={210}
            height={210}
            className="h-48 w-48"
          />
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="website" href={website} />
            <SocialIcon kind="twitter" href={twitter_url} />
            <SocialIcon kind="github" href={git} />
          </div>
        </div>
        <div className="prose max-w-none pb-8 pt-8 dark:prose-dark xl:col-span-2">
          {children}
        </div>
      </PageHeading>
    </div>
  )
}
