import { FundSlug } from '@prisma/client'
import { env } from '../../env.mjs'

export const btcpayFundSlugToStoreId: Record<FundSlug, string> = {
  monero: env.BTCPAY_MONERO_STORE_ID,
  firo: env.BTCPAY_FIRO_STORE_ID,
  privacyguides: env.BTCPAY_PRIVACY_GUIDES_STORE_ID,
  general: env.BTCPAY_GENERAL_STORE_ID,
}

export const btcpayFundSlugToWebhookSecret: Record<FundSlug, string> = {
  monero: env.BTCPAY_MONERO_WEBHOOK_SECRET,
  firo: env.BTCPAY_FIRO_WEBHOOK_SECRET,
  privacyguides: env.BTCPAY_PRIVACY_GUIDES_WEBHOOK_SECRET,
  general: env.BTCPAY_GENERAL_WEBHOOK_SECRET,
}

export const btcpayStoreIdToFundSlug: Record<string, FundSlug> = {}

Object.entries(btcpayFundSlugToStoreId).forEach(
  ([fundSlug, storeId]) => (btcpayStoreIdToFundSlug[storeId] = fundSlug as FundSlug)
)

export const fundSlugToCustomerIdAttr: Record<FundSlug, string> = {
  monero: 'stripeMoneroCustomerId',
  firo: 'stripeFiroCustomerId',
  privacyguides: 'stripePgCustomerId',
  general: 'stripeGeneralCustomerId',
}
