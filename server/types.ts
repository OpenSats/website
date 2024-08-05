import Stripe from 'stripe'

export type DonationMetadata = {
  userId: string | null
  donorEmail: string | null
  donorName: string | null
  projectSlug: string
  projectName: string
  membershipExpiresAt: string | null
}

export type Donation = {
  projectName: string
  fundName: string
  invoiceId: string
  type: 'one_time' | 'recurring'
  method: 'fiat' | 'crypto'
  stripePaymentStatus: Stripe.PaymentIntent.Status | null
  stripeSubscriptionStatus: Stripe.Subscription.Status | null
  btcPayStatus: 'Expired' | 'Invalid' | 'New' | 'Processing' | 'Settled' | null
  amount: number
  subscriptionCancelAt: Date | null
  createdAt: Date
}
