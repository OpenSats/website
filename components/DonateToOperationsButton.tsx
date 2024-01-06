import { useState } from 'react'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import PaymentModal from './PaymentModal'

export default function DonateToOperationsButton() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project>()
  const operationsBudget = allProjects.find(
    (p) => p.slug === 'opensats_operations_budget'
  )

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: Project) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  function openOperationsBudgetModal() {
    openPaymentModal(operationsBudget)
  }

  return (
    <>
      <button
        onClick={openOperationsBudgetModal}
        className="mb-2 mr-2 mt-8 block rounded bg-orange-500 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-black dark:text-black dark:hover:text-white"
      >
        Donate to Operations Budget
      </button>
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}
