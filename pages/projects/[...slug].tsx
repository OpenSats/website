import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import { InferGetStaticPropsType } from 'next'
import { allProjects } from 'contentlayer/generated'
import { useEffect, useState } from 'react'
import { Stats } from 'utils/types'
import { fetchPostJSON } from 'utils/api-helpers'
import { Project } from 'contentlayer/generated'
import PaymentModal from '@/components/PaymentModal'
import CustomLink from '@/components/Link'

const DEFAULT_LAYOUT = 'ProjectLayout'

export async function getStaticPaths() {
  return {
    paths: allProjects.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = (params.slug as string[]).join('/')
  const project = allProjects.find((p) => p.slug === slug)

  return {
    props: {
      project,
      zaprite: project.zaprite,
    },
  }
}

export default function ProjectPage({
  project,
  zaprite,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [stats, setStats] = useState<Stats>()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project>()

  function formatBtc(bitcoin: number) {
    if (bitcoin > 0.1) {
      return `₿ ${bitcoin.toFixed(3) || 0.0}`
    } else {
      return `${Math.floor(bitcoin * 100000000).toLocaleString()} sats`
    }
  }

  function formatUsd(dollars: number): string {
    if (dollars == 0) {
      return ''
    } else if (dollars / 1000000 >= 1) {
      return `+ $${Math.round(dollars / 1000000)}M`
    } else if (dollars / 1000 >= 1) {
      return `+ $${Math.round(dollars / 1000)}k`
    } else {
      return `+ $${dollars.toFixed(0)}`
    }
  }

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal() {
    console.log('opening single project modal...')
    setSelectedProject(project)
    setModalOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      setStats(undefined)
      const data = await fetchPostJSON('/api/info', { zaprite })
      setStats(data)
    }

    fetchData().catch(console.error)
  }, [zaprite])
  return (
    <>
      <MDXLayoutRenderer
        layout={DEFAULT_LAYOUT}
        content={project}
        MDXComponents={MDXComponents}
      />
      <aside className="bg-light mb-8 flex min-w-[20rem] items-center justify-between gap-4 rounded-xl p-4 lg:flex-col lg:items-start">
        {project.geyser && (
          <CustomLink
            href={project.geyser}
            className="block rounded border border-stone-800 bg-stone-800 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500"
          >
            Donate via Geyser
          </CustomLink>
        )}
        {!project.geyser && (
          <button
            onClick={openPaymentModal}
            className="block rounded border border-stone-800 bg-stone-800 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500"
          >
            Donate
          </button>
        )}
        {stats && (
          <div>
            <h5>Raised</h5>
            <h4>{`${formatBtc(stats.btc.total)} ${formatUsd(
              stats.usd.total + project.bonusUSD
            )}`}</h4>
          </div>
        )}

        {stats && (
          <div>
            <h5>Donations</h5>
            <h4>{stats.btc.donations + stats.usd.donations}</h4>
          </div>
        )}
      </aside>
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}
