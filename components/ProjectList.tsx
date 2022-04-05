import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faC, faClose } from '@fortawesome/free-solid-svg-icons'
import ProjectCard from './ProjectCard'
import Link from 'next/link'
import { ProjectItem } from '../utils/types'
import { useEffect, useState } from 'react'

type ProjectListProps = {
  header?: string
  exclude?: string
  projects: ProjectItem[]
  openPaymentModal: (project: ProjectItem) => void
}
const ProjectList: React.FC<ProjectListProps> = ({
  header = 'Explore Projects',
  exclude,
  projects,
  openPaymentModal,
}) => {
  const [sortedProjects, setSortedProjects] = useState<ProjectItem[]>()

  useEffect(() => {
    setSortedProjects(projects.filter(p => p.slug !== exclude).sort(() => 0.5 - Math.random()))
  }, [projects])

  return (
    <section className="p-4 md:p-8 bg-light flex flex-col items-center">
      <div className="flex justify-between items-center pb-8 w-full">
        <h1>{header}</h1>
        <div className="flex items-center">
          <Link href="/projects">View All</Link>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="ml-1 w-4 h-4 text-textgray cursor-pointer"
          />
        </div>
      </div>
      <ul className="grid md:grid-cols-3 gap-4 max-w-5xl">
        {sortedProjects &&
          sortedProjects.slice(0, 3).map((p, i) => (
            <li key={i} className="">
              <ProjectCard project={p} openPaymentModal={openPaymentModal} />
            </li>
          ))}
      </ul>
    </section>
  )
}

export default ProjectList
