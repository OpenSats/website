import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import PaymentModal from '../../components/PaymentModal'
import ProjectCard from '../../components/ProjectCard'
import { ProjectItem } from '../../utils/types'
import { getAllPosts } from '../../utils/md'

const AllProjects: NextPage<{ projects: ProjectItem[] }> = ({ projects }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  const [sortedProjects, setSortedProjects] = useState<ProjectItem[]>()
  const [openSatsProjects, setOpenSatsProjects] = useState<ProjectItem[]>()

  useEffect(() => {
    setSortedProjects(
      projects.filter(isNotOpenSatsProject).sort(() => 0.5 - Math.random())
    )
    setOpenSatsProjects(
      projects
        .filter(isOpenSatsProject)
        .sort((a, b) => a.title.localeCompare(b.title))
    )
  }, [projects])

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: ProjectItem) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  return (
    <>
      <Head>
        <title>OpenSats | Projects</title>
      </Head>
      <section className="flex flex-col items-center p-4 md:p-8">
        <div className="flex w-full items-center justify-between pb-8">
          <h1 id="funds">OpenSats Funds</h1>
        </div>
        <ul className="grid max-w-5xl gap-4 md:grid-cols-3">
          {openSatsProjects &&
            openSatsProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard project={p} openPaymentModal={openPaymentModal} />
              </li>
            ))}
        </ul>
      </section>
      <section className="flex flex-col p-4 md:p-8">
        <div className="flex w-full items-center justify-between pb-8">
          <h1 id="funds">Vetted Projects</h1>
        </div>
        <ul className="grid max-w-5xl gap-4 md:grid-cols-3">
          {sortedProjects &&
            sortedProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard project={p} openPaymentModal={openPaymentModal} />
              </li>
            ))}
        </ul>
      </section>
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}

export default AllProjects

export async function getStaticProps({ params }: { params: any }) {
  const projects = getAllPosts()

  return {
    props: {
      projects,
    },
  }
}

export function isOpenSatsProject(project: ProjectItem): boolean {
  return project.nym === 'OpenSats'
}

export function isNotOpenSatsProject(project: ProjectItem): boolean {
  return !isOpenSatsProject(project)
}
