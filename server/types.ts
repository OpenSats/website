import { FundSlug } from '../utils/funds'

export type DonationMetadata = {
  userId: string | null
  donorEmail: string | null
  donorName: string | null
  projectSlug: string
  projectName: string
  fundSlug: FundSlug
  isMembership: 'true' | 'false'
  isSubscription: 'true' | 'false'
}
