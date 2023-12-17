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
      'h-full space-y-4 rounded-xl border-b-4 border-purple-600 bg-stone-100 dark:border-purple-600 dark:bg-stone-900'
  } else if (tags.includes('Lightning')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-yellow-300 bg-stone-100 dark:border-yellow-300 dark:bg-stone-900'
  } else if (tags.includes('Bitcoin')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-orange-400 bg-stone-100 dark:border-orange-400 dark:bg-stone-900'
  } else {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-stone-100 bg-stone-100 dark:border-stone-800 dark:bg-stone-900'
  }

  return (
    <figure className={cardStyle}>
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
        <figcaption className="space-y-1 pb-4 pl-2 pr-2 pt-4">
          <h2 className="font-bold">{title}</h2>
          <div className="mb-8 text-sm">by {nym}</div>
          <div className="line-clamp-4">{summary}</div>
        </figcaption>
      </Link>
    </figure>
  )
}

export default ProjectCard
