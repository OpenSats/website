import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import ProjectList from '../components/ProjectList'
import PaymentModal from '../components/PaymentModal'
import Link from 'next/link'
import Image from 'next/image'
import statistical from '/public/img/project/Statistical-Monero-Logo.gif'
import { getAllPosts } from '../utils/md'
import { ProjectItem } from '../utils/types'
import { useRouter } from 'next/router'

const Home: NextPage<{ projects: any }> = ({ projects }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const router = useRouter()

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: ProjectItem) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  useEffect(() => {
    if (router.isReady) {
      console.log(router.query);
    }
  }, [router.isReady])

  return (
    <>
      <Head>
        <title>OpenSats</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <section className="flex py-8 items-center">
          <div className="p-4 md:p-8 space-y-8 basis-2/3 max-w-4xl">
            <h1>
              Support contributors to Monero
            </h1>
            <p className="text-textgray">
              Donations are tax-deductible in the USA as MAGIC is a 501(c)(3) charity
            </p>
            <p>  
              Want to receive funding for your work?{' '}
              <Link href="https://github.com/MAGICGrants/Monero-Fund/blob/main/Research-Grant-RFP.md">
                <a>Apply for your project to be listed.</a>
              </Link>
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image width={388} height={388} src={statistical} alt="Monero Statistical GIF" />
          </div>
        </section>
        <ProjectList projects={projects} openPaymentModal={openPaymentModal} />
      </main>
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}

export default Home

export async function getStaticProps({ params }: { params: any }) {
  const projects = getAllPosts()

  return {
    props: {
      projects,
    },
  }
}
