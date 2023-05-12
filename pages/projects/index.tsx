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
    setSortedProjects(projects.filter(isNotOpenSatsProject).sort(() => 0.5 - Math.random()))
    setOpenSatsProjects(projects.filter(isOpenSatsProject).sort((a, b) => a.title.localeCompare(b.title)))
  }, [projects])

  function isOpenSatsProject(project: ProjectItem): boolean {
    return project.nym === 'OpenSats'
  }

  function isNotOpenSatsProject(project: ProjectItem): boolean {
    return !isOpenSatsProject(project)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: ProjectItem) {
    setSelectedProject(project)
    setModalOpen(true)
  }
  // const projects = ["one", "two", "three", "one", "two", "three", "one", "two", "three"];

  return (
    <>
      <Head>
        <title>OpenSats | Projects</title>
      </Head>
      <section className="p-4 md:p-8 flex flex-col items-center">
        <div className="flex justify-between items-center pb-8 w-full">
          <h1>Projects</h1>
        </div>
        <ul className="grid md:grid-cols-3 gap-4 max-w-5xl">
          {sortedProjects &&
            sortedProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard project={p} openPaymentModal={openPaymentModal} />
              </li>
            ))}
        </ul>
      </section>
      <section className="p-4 md:p-8 flex flex-col items-center">
        <div className="flex justify-between items-center pb-8 w-full">
          <h1 id="funds">Specific Funds</h1>
        </div>
        <ul className="grid md:grid-cols-3 gap-4 max-w-5xl">
          {openSatsProjects &&
            openSatsProjects.map((p, i) => (
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
