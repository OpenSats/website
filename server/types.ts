export type DonationMetadata = {
  userId: string | null
  donorEmail: string | null
  donorName: string | null
  projectSlug: string
  projectName: string
  isMembership: 'true' | 'false'
  isSubscription: 'true' | 'false'
}
