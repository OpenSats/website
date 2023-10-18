import { useState } from 'react'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import PaymentModal from './PaymentModal'

export default function DonateToNostrFundButton() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project>()
  const generalFund = allProjects.find((p) => p.slug === 'nostr')

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: Project) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  function openNostrFundModal() {
    openPaymentModal(generalFund)
  }

  return (
    <>
      <button
        onClick={openNostrFundModal}
        className="mb-2 mr-2 block rounded bg-purple-500 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-purple-500 hover:text-black dark:text-black dark:hover:text-white"
      >
        Donate to The Nostr Fund
      </button>
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}
