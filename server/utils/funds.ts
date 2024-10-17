import { FundSlug } from '@prisma/client'
import { env } from '../../env.mjs'

export const fundSlugToCustomerIdAttr: Record<FundSlug, string> = {
  monero: 'stripeMoneroCustomerId',
  firo: 'stripeFiroCustomerId',
  privacyguides: 'stripePgCustomerId',
  general: 'stripeGeneralCustomerId',
}

export const fundSlugToRecipientEmail: Record<FundSlug, string> = {
  monero: env.MONERO_APPLICATION_RECIPIENT,
  firo: env.MONERO_APPLICATION_RECIPIENT,
  privacyguides: env.MONERO_APPLICATION_RECIPIENT,
  general: env.MONERO_APPLICATION_RECIPIENT,
}
