import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { ProjectItem } from '../utils/types'
import { useFundSlug } from '../utils/use-fund-slug'
import Progress from './Progress'
import { cn } from '../utils/cn'

const numberFormat = Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' })

export type ProjectCardProps = {
  project: ProjectItem
  customImageStyles?: React.CSSProperties
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, customImageStyles }) => {
  const [isHorizontal, setIsHorizontal] = useState<boolean | null>(null)

  useEffect(() => {
    const img = document.createElement('img')
    img.src = project.coverImage

    // check if image is horizontal - added additional 10% to height to ensure only true
    // horizontals get flagged.
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img
      const isHorizontal = naturalWidth >= naturalHeight * 1.1
      setIsHorizontal(isHorizontal)
    }
  }, [project.coverImage])

  return (
    <Link href={`/${project.fund}/projects/${project.slug}`} passHref target="_blank">
      <figure
        className={cn(
          'max-w-sm min-h-[460px] h-full space-y-2 flex flex-col rounded-xl border-b-4 bg-white',
          project.fund === 'monero' && 'border-monero',
          project.fund === 'firo' && 'border-firo',
          project.fund === 'privacyguides' && 'border-privacyguides',
          project.fund === 'general' && 'border-primary'
        )}
      >
        <div className="flex h-36 w-full sm:h-52">
          <Image
            alt={project.title}
            src={project.coverImage}
            width={1200}
            height={1200}
            style={{
              objectFit: 'contain',
              ...customImageStyles,
            }}
            priority={true}
            className="cursor-pointer rounded-t-xl bg-white"
          />
        </div>

        <figcaption className="p-5 flex flex-col grow space-y-4 justify-between">
          <div className="flex flex-col space-y-2">
            <div>
              <h2 className="font-bold">{project.title}</h2>
              <span className="text-sm text-gray-700">by {project.nym}</span>
            </div>

            <span className="line-clamp-3 text-gray-400">{project.summary}</span>

            <span className="font-bold">
              Goal: <span className="text-green-500">${numberFormat.format(project.goal)}</span>
            </span>
          </div>

          <Progress
            current={
              project.totalDonationsBTCInFiat +
              project.totalDonationsXMRInFiat +
              project.totalDonationsFiat
            }
            goal={project.goal}
          />
        </figcaption>
      </figure>
    </Link>
  )
}

export default ProjectCard
