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
}
