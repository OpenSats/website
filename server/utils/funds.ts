import { FundSlug } from '@prisma/client'
import { env } from '../../env.mjs'

export const fundSlugToCustomerIdAttr: Record<FundSlug, string> = {
  monero: 'stripeMoneroCustomerId',
  firo: 'stripeFiroCustomerId',
  privacyguides: 'stripePgCustomerId',
  general: 'stripeGeneralCustomerId',
}

export const fundSlugToRecipientEmail: Record<FundSlug, string> = {
  monero: env.NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT,
  firo: env.NEXT_PUBLIC_FIRO_APPLICATION_RECIPIENT,
  privacyguides: env.NEXT_PUBLIC_PRIVACY_GUIDES_APPLICATION_RECIPIENT,
  general: env.NEXT_PUBLIC_GENERAL_APPLICATION_RECIPIENT,
}
