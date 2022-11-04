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
  const { slug, title, summary, coverImage, git, twitter, personalTwitter, nym } =
    project

  return (
    <figure className=" bg-white space-y-4 border border-lightgray rounded-xl h-full">
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
          <Link href={`https://twitter.com/${personalTwitter || twitter}`} passHref legacyBehavior>
            <a className="projectlist">{nym}</a>
          </Link>
        </p>
        <p className="prose line-clamp-3">{summary}</p>
        <div className="flex justify-end"></div>

        <ShareButtons project={project} />
        <div className="flex space-x-4 items-center justify-center pt-4">
          <button
            className="bg-black basis-1/2"
            onClick={() => openPaymentModal(project)}
          >
            Donate
          </button>
          <div className="flex items-center justify-center basis-1/2">
            <Link href={`/projects/${slug}`} passHref legacyBehavior>
              <a className="projectlist">View Details</a>
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
