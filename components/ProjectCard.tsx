import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { ProjectItem } from '../utils/types'

export type ProjectCardProps = {
  project: ProjectItem
  customImageStyles?: React.CSSProperties
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  customImageStyles,
}) => {
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

  let cardStyle
  // if (tags.includes('Nostr')) {
  //   cardStyle =
  //     'h-full space-y-4 rounded-xl border-b-4 border-purple-600 bg-stone-100 dark:border-purple-600 dark:bg-stone-900'
  // } else if (tags.includes('Lightning')) {
  //   cardStyle =
  //     'h-full space-y-4 rounded-xl border-b-4 border-yellow-300 bg-stone-100 dark:border-yellow-300 dark:bg-stone-900'
  // } else if (tags.includes('Bitcoin')) {
  //   cardStyle =
  //     'h-full space-y-4 rounded-xl border-b-4 border-orange-400 bg-stone-100 dark:border-orange-400 dark:bg-stone-900'
  // } else {
  cardStyle =
    'h-full space-y-4 rounded-xl border-b-4 border-orange-500 bg-stone-100 dark:bg-stone-900'
  // }

  return (
    <figure className={cardStyle}>
      <Link href={`/projects/${project.slug}`} passHref>
        <div className="flex h-36 w-full sm:h-52">
          <Image
            alt={project.title}
            src={project.coverImage}
            width={1200}
            height={1200}
            style={{
              objectFit: 'cover',
              ...customImageStyles,
            }}
            priority={true}
            className="cursor-pointer rounded-t-xl bg-white"
          />
        </div>
        <figcaption className="p-2">
          <h2 className="font-bold">{project.title}</h2>
          <div className="mb-4 text-sm">by {project.nym}</div>
          <div className="mb-2 line-clamp-3">{project.summary}</div>
        </figcaption>
      </Link>
    </figure>
  )
}

export default ProjectCard
