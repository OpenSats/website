import { FundSlug } from '@prisma/client'

export type KeycloakJwtPayload = {
  sub: string
  email: string
}

export type UserSettingsJwtPayload = {
  action: 'email_verify' | 'password-reset'
  tokenVersion: number
  userId: string
  email: string
}

export type DonationMetadata = {
  userId: string | null
  donorEmail: string | null
  donorName: string | null
  projectSlug: string
  projectName: string
  fundSlug: FundSlug
  itemDesc?: string
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
  paymentMethod: string
  paymentMethodPaid: string
  destination: string
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

export type StrapiPerk = {
  id: number
  documentId: string
  name: string
  description: string
  price: number
  fundSlugWhitelist: string | null
  needsShippingAddress: boolean
  images: {
    formats: {
      large: { url: string }
      medium: { url: string }
      small: { url: string }
      thumbnail: { url: string }
    }
  }[]
  createdAt: string
  updatedAt: string
  publishedAt: string
}

type StrapiOrder = {
  id: number
  documentId: string
  userId: string
  userEmail: string
  shippingAddressLine1: string
  shippingAddressLine2: string
  shippingCity: string
  shippingState: string
  shippingCountry: string
  shippingZip: string
  shippingPhone: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: null
}

export type StrapiGetPerksRes = {
  data: StrapiPerk[]

  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export type StrapiGetPerkRes = {
  data: StrapiPerk | null

  meta: {}
}

export type StrapiCreateOrderRes = {
  data: StrapiOrder
  meta: {}
}
