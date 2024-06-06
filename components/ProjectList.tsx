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
}

const ProjectList: React.FC<ProjectListProps> = ({
  header = 'Explore Projects',
  exclude,
  projects,
}) => {
  const [sortedProjects, setSortedProjects] = useState<ProjectItem[]>()

  useEffect(() => {
    setSortedProjects(
      projects.filter((p) => p.slug !== exclude).sort(() => 0.5 - Math.random())
    )
  }, [projects])

  return (
    <section className="bg-light items-left flex flex-col">
      <ul className="grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
        {sortedProjects &&
          sortedProjects.slice(0, 4).map((p, i) => (
            <li key={i} className="">
              <ProjectCard
                project={p}
                // tags={p.tags}
              />
            </li>
          ))}
      </ul>
    </section>
  )
}

export default ProjectList
