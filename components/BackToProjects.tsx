import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

const BackToProjects = () => {
  return (
    <div className="flex items-center pb-4">
      <FontAwesomeIcon
        icon={faArrowLeft}
        className="mr-1 w-4 h-4 text-primary"
      />
      <Link href="/projects" aria-label='Back to projects' className='text-primary'>
        Back to projects
      </Link>
    </div>
  )
}

export default BackToProjects
