import { ReactNode } from 'react'
import Link from 'next/link'

import { ProjectItem } from '../utils/types'
import CustomLink from './CustomLink'
import Image from 'next/image'
import SocialIcon from './social-icons'

interface Props {
  project: ProjectItem
  children: ReactNode
}

export default function PageHeading({ project, children }: Props) {
  return (
    <div className="divide-y divide-gray-200">
      <div className="items-start space-y-2 pb-8 pt-6 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
        <Image
          src={project.coverImage}
          alt="avatar"
          width={300}
          height={300}
          className="h-60 w-60 mx-auto my-auto object-contain row-span-3 hidden xl:block"
        />

        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 xl:col-span-2">
          {project.title}
        </h1>

        <p>{project.summary}</p>

        <div></div>

        <div className="flex space-x-3 items-center">
          <p>
            by <CustomLink href={project.personalWebsite}>{project.nym}</CustomLink>
          </p>

          <SocialIcon kind="website" href={project.website} />
          {project.twitter && (
            <SocialIcon kind="twitter" href={`https://twitter.com/${project.twitter}`} />
          )}
          <SocialIcon kind="github" href={project.git} />
          {/* {nostr && (
                <SocialIcon kind="nostr" href={`https://njump.me/${nostr}`} />
              )} */}
        </div>
      </div>

      <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
        {children}
      </div>
    </div>
  )
}
