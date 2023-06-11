import Image from 'next/image'

import Link from 'next/link'
import { ProjectItem } from '../utils/types'

export type ProjectCardProps = {
  project: ProjectItem
  openPaymentModal: (project: ProjectItem) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  openPaymentModal,
}) => {
  const {
    slug,
    title,
    summary,
    coverImage,
    git,
    twitter,
    personalTwitter,
    nym,
    zaprite,
  } = project

  return (
    <figure className="h-full space-y-4 rounded-xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
      <div className="relative h-64 w-full">
        <Link href={`/projects/${slug}`} passHref>
          <div className="relative h-64 w-full">
            <Image
              alt={title}
              src={coverImage}
              layout="fill"
              objectFit="cover"
              objectPosition="50% 50%"
              className="cursor-pointer rounded-t-xl bg-white dark:bg-black"
            />
          </div>
        </Link>
      </div>

      <figcaption className="space-y-1 p-4">
        <h2 className="font-bold">{title}</h2>
        <div className="mb-8 text-sm">
          by{' '}
          <Link
            href={`https://twitter.com/${personalTwitter || twitter}`}
            passHref
          >
            {nym}
          </Link>
        </div>
        <div className="line-clamp-3">{summary}</div>

        <div className="grid grid-cols-2 pt-4">
          <button
            className="rounded border border-stone-800 bg-stone-800 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500"
            onClick={() => openPaymentModal(project)}
          >
            Donate
          </button>
          <Link
            href={`/projects/${slug}`}
            passHref
            className="text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 pt-2 text-center hover:underline"
            aria-label="View Details"
          >
            View Details &rarr;
          </Link>
        </div>
      </figcaption>
    </figure>
  )
}

export default ProjectCard
