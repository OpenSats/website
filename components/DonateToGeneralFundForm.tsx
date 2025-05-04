import { allFunds } from 'contentlayer/generated'
import DonationForm from './DonationForm'

export default function DonateToGeneralFundButton() {
  const generalFund = allFunds.find((f) => f.slug === 'general')

  return (
    <>
      <DonationForm
        projectNamePretty={generalFund.title}
        btcpay={generalFund.btcpay}
        zaprite={generalFund.zaprite}
        store={generalFund.store}
      />
      <div className="mb-24"></div>
    </>
  )
}
