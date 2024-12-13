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
  showDonorNameOnLeaderboard: 'true' | 'false'
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
  printfulProductId: string | null
  productDetailsUrl: string | null
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
  printfulCarrier?: string
  printfulTrackingUrl?: string
  printfulTrackingNumber?: string
}

type StrapiOrderPopulated = StrapiOrder & { perk: StrapiPerk }

export type StrapiGetOrdersPopulatedRes = {
  data: StrapiOrderPopulated[] | null

  meta: {}
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

export type StrapiUpdateOrderBody = {
  data: Partial<
    Omit<StrapiOrder, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
      perk: string
    }
  >
}

export type StrapiUpdateOrderRes = {
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

// Printful Product

export type PrintfulGetProductRes = {
  code: number
  result: {
    sync_product: {
      id: number
      external_id: string
      name: string
      variants: number
      synced: number
      thumbnail_url: string
      is_ignored: boolean
    }
    sync_variants: [
      {
        id: number
        external_id: string
        sync_product_id: number
        name: string
        synced: boolean
        variant_id: number
        retail_price: string
        currency: string
        is_ignored: boolean
        sku: string
        main_category_id: boolean
        warehouse_product_id: boolean
        warehouse_product_variant_id: boolean
        size: string
        color: string
        availability_status: 'active' | 'discontinued' | 'out_of_stock' | 'temporary_out_of_stock'
      },
    ]
  }
}

// Printful country/state code

export type PrintfulGetCountriesRes = {
  code: number
  result: [
    {
      code: string
      name: string
      states: { code: string; name: string }[] | null
      region: string
    },
  ]
}

// Printful estimate order

export type PrintfulEstimateOrderReq = {
  recipient: {
    address1: string
    address2: string
    city: string
    state_code: string
    country_code: string
    zip: string
    name: string
    phone: string
    email: string
    tax_number?: string
  }
  items: [{ sync_variant_id: number; quantity: 1 }]
}

export type PrintfulEstimateOrderRes = {
  code: number
  result: {
    costs: {
      currency: 'USD'
      subtotal: number
      discount: number
      shipping: number
      digitization: number
      additional_fee: number
      fulfillment_fee: number
      retail_delivery_fee: number
      tax: number
      vat: number
      total: number
    }
  }
}

// Printful create order

export type PrintfulCreateOrderReq = {
  recipient: {
    name: string
    address1: string
    address2: string
    city: string
    state_code: string
    country_code: string
    zip: string
    phone: string
    email: string
    tax_number?: string
  }
  items: [{ sync_variant_id: number; quantity: 1 }]
}

export type PrintfulCreateOrderRes = {
  costs: {
    currency: 'USD'
    subtotal: string
    discount: string
    shipping: string
    digitization: string
    additional_fee: string
    fulfillment_fee: string
    retail_delivery_fee: string
    tax: string
    vat: string
    total: string
  }
}
