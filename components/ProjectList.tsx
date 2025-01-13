import ProjectCard from './ProjectCard'
import { Project } from 'contentlayer/generated'
import { useEffect, useState } from 'react'

type ProjectListProps = {
  header?: string
  exclude?: string
  projects: Project[]
}
const ProjectList: React.FC<ProjectListProps> = ({ exclude, projects }) => {
  const [sortedProjects, setSortedProjects] = useState<Project[]>()

  useEffect(() => {
    setSortedProjects(
      projects.filter((p) => p.slug !== exclude).sort(() => 0.5 - Math.random())
    )
  }, [exclude, projects])

  return (
    <section className="bg-light items-left flex flex-col">
      <ul className="grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
        {sortedProjects &&
          sortedProjects.slice(0, 4).map((p, i) => (
            <li key={i} className="">
              <ProjectCard
                slug={`/projects/${p.slug}`}
                title={p.title}
                summary={p.summary}
                coverImage={p.coverImage}
                nym={p.nym}
                tags={p.tags}
              />
            </li>
          ))}
      </ul>
    </section>
  )
}

export default ProjectList
