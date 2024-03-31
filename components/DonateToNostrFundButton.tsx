import { useState } from 'react'
import { allFunds } from 'contentlayer/generated'
import type { Fund } from 'contentlayer/generated'
import PaymentModal from './PaymentModal'

export default function DonateToNostrFundButton() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFund, setSelectedFund] = useState<Fund>()
  const generalFund = allFunds.find((p) => p.slug === 'nostr')

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(fund: Fund) {
    setSelectedFund(fund)
    setModalOpen(true)
  }

  function openNostrFundModal() {
    openPaymentModal(generalFund)
  }

  return (
    <>
      <button
        onClick={openNostrFundModal}
        className="mb-4 mr-2 mt-8 block rounded bg-purple-500 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-purple-500 hover:text-black dark:text-black dark:hover:text-white"
      >
        Donate to The Nostr Fund
      </button>
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        fund={selectedFund}
      />
    </>
  )
}
