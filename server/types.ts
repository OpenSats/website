export type DonationMetadata = {
  userId: string | null
  donorEmail: string | null
  donorName: string | null
  projectSlug: string
  projectName: string
}

export type Donation = {
  projectName: string
  fundName: string
  type: 'one_time' | 'recurring'
  method: 'fiat' | 'crypto'
  amount: number
  expiresAt: Date | null
  createdAt: Date
}
