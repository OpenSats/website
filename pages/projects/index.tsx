import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import ProjectCard from '../../components/ProjectCard'
import { allProjects, allFunds } from 'contentlayer/generated'
import { Project, Fund } from 'contentlayer/generated'

const AllProjects: NextPage<{ projects: Project[]; funds: Fund[] }> = ({
  projects,
  funds,
}) => {
  const [sortedProjects, setSortedProjects] = useState<Project[]>()
  const [openSatsProjects, setOpenSatsProjects] = useState<Fund[]>()

  useEffect(() => {
    setSortedProjects(
      projects.filter(isShowcaseProject).sort(() => 0.5 - Math.random())
    )
    setOpenSatsProjects(funds.sort((a, b) => a.title.localeCompare(b.title)))
  }, [projects, funds])

  return (
    <>
      <Head>
        <title>OpenSats | Funds & Projects</title>
      </Head>
      <section className="flex flex-col items-center p-4 md:p-8">
        <div className="flex w-full items-center justify-between pb-8">
          <h1 id="funds">Our Funds</h1>
        </div>
        <ul className="grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3">
          {openSatsProjects &&
            openSatsProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard
                  slug={p.slug}
                  title={p.title}
                  summary={p.summary}
                  coverImage={p.coverImage}
                  nym={p.nym}
                  tags={p.tags}
                  customImageStyles={{ objectFit: 'cover' }}
                />
              </li>
            ))}
        </ul>
      </section>
      <section className="flex flex-col p-4 md:p-8">
        <div className="flex w-full items-center justify-between pb-8">
          <h1 id="funds">Project Showcase</h1>
        </div>
        <ul className="grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {sortedProjects &&
            sortedProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard
                  slug={p.slug}
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
    </>
  )
}

export default AllProjects

export async function getStaticProps({ params }: { params: any }) {
  const projects = allProjects
  const funds = allFunds

  return {
    props: {
      projects,
      funds,
    },
  }
}

export function isOpenSatsProject(project: Project): boolean {
  return project.nym === 'OpenSats'
}

export function isNotOpenSatsProject(project: Project): boolean {
  return !isOpenSatsProject(project)
}

export function isShowcaseProject(project: Project): boolean {
  return isNotOpenSatsProject(project) && project.showcase
}
