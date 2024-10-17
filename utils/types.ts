import { FundSlug } from '@prisma/client'

export type ProjectItem = {
  slug: string
  fund: FundSlug
  nym: string
  content?: string
  title: string
  summary: string
  coverImage: string
  website: string
  socialLinks: string[]
  date: string
  staticXMRaddress?: string | null
  goal: number
  isFunded?: boolean
  numDonationsBTC: number
  numDonationsXMR: number
  numDonationsFiat: number
  totalDonationsBTC: number
  totalDonationsXMR: number
  totalDonationsFiat: number
  totalDonationsBTCInFiat: number
  totalDonationsXMRInFiat: number
}

export type PayReq = {
  amount: number
  project_slug: string
  project_name: string
  email?: string
  name?: string
}

export type ProjectDonationStats = {
  xmr: {
    count: number
    amount: number
    fiatAmount: number
  }
  btc: {
    count: number
    amount: number
    fiatAmount: number
  }
  usd: {
    count: number
    amount: number
    fiatAmount: number
  }
}
