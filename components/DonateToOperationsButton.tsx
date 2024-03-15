import { useState } from 'react'
import { allFunds } from 'contentlayer/generated'
import type { Fund } from 'contentlayer/generated'
import PaymentModal from './PaymentModal'

export default function DonateToOperationsButton() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFund, setSelectedFund] = useState<Fund>()
  const operationsBudget = allFunds.find(
    (p) => p.slug === 'opensats_operations_budget'
  )

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: Fund) {
    setSelectedFund(project)
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
        fund={selectedFund}
      />
    </>
  )
}
