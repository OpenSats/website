import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import ProjectCard from '../../../components/ProjectCard'
import { ProjectItem } from '../../../utils/types'
import { getProjects } from '../../../utils/md'
import { useFundSlug } from '../../../utils/use-fund-slug'
import { funds, fundSlugs } from '../../../utils/funds'

const AllProjects: NextPage<{ projects: ProjectItem[] }> = ({ projects }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectItem>()
  const [sortedProjects, setSortedProjects] = useState<ProjectItem[]>()
  const fundSlug = useFundSlug()

  useEffect(() => {
    setSortedProjects(projects.sort(() => 0.5 - Math.random()))
  }, [projects])

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: ProjectItem) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  if (!fundSlug) return <></>

  return (
    <>
      <Head>{fundSlug && <title>{funds[fundSlug].title} | Projects</title>}</Head>
      <section className="flex flex-col items-center">
        <div className="flex justify-between items-center pb-8 w-full">
          <h1 className="py-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Projects
          </h1>
        </div>
        <ul className="grid md:grid-cols-3 gap-4 max-w-5xl">
          {sortedProjects &&
            sortedProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard project={p} />
              </li>
            ))}
        </ul>
      </section>
    </>
  )
}

export default AllProjects

export function getStaticPaths() {
  return {
    paths: fundSlugs.map((fundSlug) => `/${fundSlug}/projects`),
    fallback: false,
  }
}

export async function getStaticProps({ params, ...asd }: { params: any }) {
  const projects = await getProjects(params.fund)

  return {
    props: {
      projects,
    },
    revalidate: 120,
  }
}
