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
  // const projects = ["one", "two", "three", "one", "two", "three", "one", "two", "three"];

  return (
    <>
      <Head>
        <title>MAGIC Monero Fund | Projects</title>
      </Head>
      <section className="p-4 md:p-8 flex flex-col items-center">
        <div className="flex justify-between items-center pb-8 w-full">
          <h1>Projects</h1>
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
