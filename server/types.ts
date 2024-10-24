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

// Strapi Perk

export type StrapiPerk = {
  id: number
  documentId: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  name: string
  description: string
  price: number
  fundSlugWhitelist: string | null
  needsShippingAddress: boolean
}

export type StrapiPerkPopulated = StrapiPerk & {
  images: {
    formats: {
      large: { url: string }
      medium: { url: string }
      small: { url: string }
      thumbnail: { url: string }
    }
  }[]
}

export type StrapiGetPerksPopulatedRes = {
  data: StrapiPerkPopulated[]

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

// Strapi Order

type StrapiOrder = {
  id: number
  documentId: string
  createdAt: string
  updatedAt: string
  publishedAt: string

  userId: string
  userEmail: string
  shippingAddressLine1?: string
  shippingAddressLine2?: string
  shippingCity?: string
  shippingState?: string
  shippingCountry?: string
  shippingZip?: string
  shippingPhone?: string
}

export type StrapiCreateOrderBody = {
  data: Omit<StrapiOrder, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
    perk: string
  }
}

export type StrapiCreateOrderRes = {
  data: StrapiOrder
  meta: {}
}

// Strapi Point

export type StrapiPoint = {
  id: number
  documentId: string
  createdAt: string
  updatedAt: string
  publishedAt: string

  balanceChange: string
  balance: string
  userId: string
  donationId?: string
  donationProjectSlug?: string
  donationProjectName?: string
  donationFundSlug?: FundSlug
}

export type StrapiPointPopulated = StrapiPoint & {
  perk?: StrapiPerk
  order?: StrapiOrder
}

export type StrapiCreatePointBody = {
  data: Omit<StrapiPoint, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
    perk?: string
    order?: string
  }
}

export type StrapiGetPointPopulatedRes = {
  data: StrapiPointPopulated | null

  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export type StrapiGetPointsPopulatedRes = {
  data: StrapiPointPopulated[]

  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
