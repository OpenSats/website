import { FundSlug } from '@prisma/client'

export type DonationMetadata = {
  userId: string | null
  donorEmail: string | null
  donorName: string | null
  projectSlug: string
  projectName: string
  fundSlug: FundSlug
  isMembership: 'true' | 'false'
  isSubscription: 'true' | 'false'
  isTaxDeductible: 'true' | 'false'
  staticGeneratedForApi: 'true' | 'false'
  givePointsBack: 'true' | 'false'
}

export type BtcPayGetRatesRes = [
  {
    currencyPair: string
    errors: string[]
    rate: string
  },
]

export type BtcPayGetPaymentMethodsRes = {
  rate: string
  amount: string
  cryptoCode: string
}[]

export type BtcPayCreateInvoiceBody = {
  amount?: number
  currency?: string
  metadata: DonationMetadata
}

export type BtcPayCreateInvoiceRes = {
  metadata: DonationMetadata
  checkout: any
  receipt: any
  id: string
  storeId: string
  amount: string
  currency: string
  type: string
  checkoutLink: string
  createdTime: number
  expirationTime: number
  monitoringExpiration: number
  status: 'Expired' | 'Invalid' | 'New' | 'Processing' | 'Settled'
  additionalStatus: string
  availableStatusesForManualMarking: any
  archived: boolean
}
