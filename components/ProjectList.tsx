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
  return (
    <section className="flex flex-col">
      <ul className="mx-auto grid max-w-5xl grid-cols-1 sm:mx-0 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects &&
          projects.slice(0, 6).map((p, i) => (
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
