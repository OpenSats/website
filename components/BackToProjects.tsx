import Link from 'next/link'

const BackToProjects = () => {
  return (
    <div className="flex items-center pb-4">
      <Link
        href="/projects"
        aria-label="Back to projects"
        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
      >
        &larr; Back to projects
      </Link>
    </div>
  )
}

export default BackToProjects
