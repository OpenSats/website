import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { ProjectItem } from '../utils/types'

const ShareButtons: React.FC<{ project: ProjectItem }> = ({ project }) => {
  const { git, twitter, website } = project
  return (
    <div className="mb-4 flex space-x-4">
      <Link href={git} passHref>
        <FontAwesomeIcon
          icon={faGithub}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
        />
      </Link>
      <Link href={`https://twitter.com/${twitter}`} passHref>
        <FontAwesomeIcon
          icon={faTwitter}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
        />
      </Link>
      {website && (
        <Link href={website} passHref>
          <FontAwesomeIcon
            icon={faLink}
            className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
          />
        </Link>
      )}
    </div>
  )
}

export default ShareButtons
