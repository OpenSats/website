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
              className="rounded-t-xl border border-lightgray cursor-pointer"
            />
          </div>
        </Link>
      </div>

      <figcaption className="p-4 space-y-4">
        <h2>{title}</h2>
        <p>
          by{' '}
          <Link href={`https://twitter.com/${personalTwitter || twitter}`} passHref>
            {nym}
          </Link>
        </p>
        <p className="prose line-clamp-3">{summary}</p>
        <div className="flex justify-end"></div>

        <ShareButtons project={project} />
        <div className="flex space-x-4 items-center justify-left pt-4">
          <button
            className="bg-transparent hover:bg-stone-800 text-stone-800 font-semibold hover:text-stone-100 py-2 px-4 border border-stone-800 hover:border-transparent rounded"
            onClick={() => openPaymentModal(project)}
          >
            Donate
          </button>
          <div className="flex items-center justify-right basis-1/2">
            <Link href={`/projects/${slug}`} passHref className='p-1 text-sm text-stone-800 dark:text-stone-200 sm:p-4'>
              View Details
            </Link>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="ml-1 w-4 h-4 text-textgray cursor-pointer"
            />
          </div>
        </div>
      </figcaption>
    </figure>
  )
}

export default ProjectCard
