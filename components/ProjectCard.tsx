import Image from 'next/image'
import Link from 'next/link'
import { Project } from 'contentlayer/generated'

export type ProjectCardProps = {
  project: Project
  openPaymentModal: (project: Project) => void
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
    tags,
  } = project

  let cardStyle
  if (tags.includes('Nostr')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-purple-600 bg-stone-100 dark:border-stone-800 dark:bg-stone-900'
  } else if (tags.includes('Lightning')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-yellow-300 bg-stone-100 dark:border-stone-800 dark:bg-stone-900'
  } else if (tags.includes('Bitcoin')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-orange-400 bg-stone-100 dark:border-stone-800 dark:bg-stone-900'
  } else {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-stone-100 bg-stone-100 dark:border-stone-800 dark:bg-stone-900'
  }

  return (
    <figure className={cardStyle}>
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

      <figcaption className="h-44 space-y-1 p-2">
        <h2 className="font-bold">{title}</h2>
        <div className="mb-8 text-sm">by {nym}</div>
        <div className="line-clamp-3">{summary}</div>
      </figcaption>

      <div className="grid grid-cols-2 content-center pb-2">
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
    </figure>
  )
}

export default ProjectCard
