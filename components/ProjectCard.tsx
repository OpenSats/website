import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'

import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { ProjectItem } from '../utils/types'
import PaymentModal from './PaymentModal'
import ShareButtons from './ShareButtons'

export type ProjectCardProps = {
  project: ProjectItem
  openPaymentModal: (project: ProjectItem) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  openPaymentModal,
}) => {
  const { slug, title, summary, coverImage, git, twitter, personalTwitter, nym, zaprite } =
    project

  return (
    <figure className="bg-stone-100 dark:bg-stone-900 space-y-4 border border-stone-200 dark:border-stone-800 rounded-xl h-full">
      <div className="relative h-64 w-full">
        <Link href={`/projects/${slug}`} passHref>
          <div className='relative h-64 w-full'>
            <Image
              alt={title}
              src={coverImage}
              layout="fill"
              objectFit="cover"
              objectPosition="50% 50%"
              className="rounded-t-xl cursor-pointer"
            />
          </div>
        </Link>
      </div>

      <figcaption className="p-4 space-y-1">
        <h2 className='font-bold'>{title}</h2>
        <div className='mb-8 text-sm'>
          by{' '}
          <Link href={`https://twitter.com/${personalTwitter || twitter}`} passHref>
            {nym}
          </Link>
        </div>
        <div className="prose line-clamp-3">{summary}</div>

        <div className="grid grid-cols-2 pt-4">
          <button
            className="bg-stone-800 text-white hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500 font-semibold py-2 px-4 border border-stone-800 hover:border-transparent rounded"
            onClick={() => openPaymentModal(project)}
          >
            Donate
          </button>
          <Link
            href={`/projects/${slug}`}
            passHref
            className="text-center text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 hover:underline pt-2"
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
