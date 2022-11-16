import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import ProjectList from '../components/ProjectList'
import PaymentModal from '../components/PaymentModal'
import Link from 'next/link'
import Image from 'next/image'
import magiclogo from '/public/img/crystalball.jpg'

import { getAllPosts } from '../utils/md'
import { ProjectItem } from '../utils/types'
import { useRouter } from 'next/router'

// These shouldn't be swept up in the regular list so we hardcode them
const generalFund: ProjectItem = {
  slug: 'general_fund',
  nym: 'MagicMonero',
  website: 'https://monerofund.org',
  title: 'MAGIC Monero General Fund',
  summary:
    'Support contributors to Monero',
  coverImage: '/img/crystalball.jpg',
  git: 'magicgrants',
  twitter: 'magicgrants',
  goal: 100000,
}

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

  function openGeneralFundModal() {
    openPaymentModal(generalFund)
  }

  useEffect(() => {
    if (router.isReady) {
      console.log(router.query);
    }
  }, [router.isReady])

  return (
    <>
      <Head>
        <title>Monero Fund</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <section id="root" className="flex flex-col sm:flex-row">
          <div className="flex-auto p-4 md:p-8 space-y-8 sm:order-first">
            <h1>
              Support the Monero Fund and open source research for the Monero Project.
            </h1>
            <p className="text-textgray">
              Donations are tax-deductible in the USA as MAGIC is a 501(c)(3) charity
            </p>
            <button role={'button'} onClick={openGeneralFundModal}>
              Donate to Monero Committee General Fund
            </button> 
            <p>  
              Want to receive funding for your work? {' '}
              <Link href="/apply" legacyBehavior >
                <a className="custom-link">Apply for a Monero Research Grant!</a>
              </Link>
            </p>
          </div>
          <div className="order-first flex-auto my-auto">
            <Image className="img-fluid" src={magiclogo} alt="magiclogo" />
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
