import ProjectCard from './ProjectCard'
import { Project } from 'contentlayer/generated'
import { useEffect, useState } from 'react'

type ProjectListProps = {
  header?: string
  exclude?: string
  projects: Project[]
  openPaymentModal: (project: Project) => void
}
const ProjectList: React.FC<ProjectListProps> = ({
  exclude,
  projects,
  openPaymentModal,
}) => {
  const [sortedProjects, setSortedProjects] = useState<Project[]>()

  useEffect(() => {
    setSortedProjects(
      projects.filter((p) => p.slug !== exclude).sort(() => 0.5 - Math.random())
    )
  }, [projects])

  return (
    <section className="bg-light items-left flex flex-col">
      <ul className="grid max-w-5xl gap-4 md:grid-cols-3">
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
