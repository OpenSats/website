import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import ProjectList from '../components/ProjectList'
import PaymentModal from '../components/PaymentModal'
import Link from 'next/link'

import { getAllPosts } from '../utils/md'
import { ProjectItem } from '../utils/types'
import { useRouter } from 'next/router'
import Typing from '../components/Typing'
import CustomLink from '../components/CustomLink'
import { Button } from '../components/ui/button'

// These shouldn't be swept up in the regular list so we hardcode them
const generalFund: ProjectItem = {
  slug: 'general_fund',
  nym: 'MagicMonero',
  website: 'https://monerofund.org',
  personalWebsite: 'https://monerofund.org',
  title: 'MAGIC Monero General Fund',
  summary: 'Support contributors to Monero',
  coverImage: '/img/crystalball.jpg',
  git: 'magicgrants',
  twitter: 'magicgrants',
  goal: 100000,
}

const Home: NextPage<{ projects: any }> = ({ projects }) => {
  const [modalOpen, setModalOpen] = useState(false)

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

  return (
    <>
      <Head>
        <title>Monero Fund</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-4 md:pb-8">
          <h1 className="py-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Support <Typing />
          </h1>
          <p className="text-xl leading-7 text-gray-500 dark:text-gray-400">
            Help us to provide sustainable funding for free and open-source
            contributors working on freedom tech and projects that help Monero
            flourish.
          </p>
          <div className="flex flex-wrap py-4">
            <div className="w-full md:w-1/2">
              <Button
                onClick={openGeneralFundModal}
                size="lg"
                className="px-14 text-black font-semibold text-xl"
              >
                Donate to Monero Comittee General Fund
              </Button>
            </div>
          </div>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Want to receive funding for your work?
            <CustomLink href="/apply" className="text-orange-500">
              {' '}
              Apply for a Monero development or research grant!
            </CustomLink>
          </p>

          <p className="text-md leading-7 text-gray-500 dark:text-gray-400">
            We are a 501(c)(3) public charity. All donations are tax deductible.
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="xl:pt-18 space-y-2 pt-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Explore Projects
          </h1>
          <p className="pt-2 text-lg leading-7 text-gray-500 dark:text-gray-400">
            Browse through a showcase of projects supported by us.
          </p>
          <ProjectList projects={projects} />
          <div className="flex justify-end pt-4 text-base font-medium leading-6">
            <Link
              href="/projects"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="View All Projects"
            >
              View Projects &rarr;
            </Link>
          </div>
        </div>
      </div>

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
