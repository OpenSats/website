export type DonationMetadata = {
  donorEmail: string
  donorName: string
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
