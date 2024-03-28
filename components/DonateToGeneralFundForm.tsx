import { allFunds } from 'contentlayer/generated'
import DonationForm from './DonationForm'

export default function DonateToGeneralFundButton() {
  const generalFund = allFunds.find((f) => f.slug === 'general_fund')

  return (
    <>
      <DonationForm
        projectNamePretty={generalFund.title}
        btcpay={generalFund.btcpay}
        zaprite={generalFund.zaprite}
      />
      <div className="mb-24"></div>
    </>
  )
}
