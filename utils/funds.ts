import { env } from '../env.mjs'

type FundSlugs = ['monero', 'firo', 'privacy_guides', 'general']
export type FundSlug = FundSlugs[number]

export const funds: Record<FundSlug, Record<string, any>> = {
  monero: {},
  firo: {},
  privacy_guides: {},
  general: {},
}

export const fundSlugs = Object.keys(funds) as FundSlugs

export const btcpayFundSlugToStoreId: Record<FundSlug, string> = {
  monero: env.BTCPAY_MONERO_STORE_ID,
  firo: env.BTCPAY_FIRO_STORE_ID,
  privacy_guides: env.BTCPAY_PRIVACY_GUIDES_STORE_ID,
  general: env.BTCPAY_GENERAL_STORE_ID,
}

export const btcpayFundSlugToWebhookSecret: Record<FundSlug, string> = {
  monero: env.BTCPAY_MONERO_WEBHOOK_SECRET,
  firo: env.BTCPAY_FIRO_WEBHOOK_SECRET,
  privacy_guides: env.BTCPAY_PRIVACY_GUIDES_WEBHOOK_SECRET,
  general: env.BTCPAY_GENERAL_WEBHOOK_SECRET,
}

export const btcpayStoreIdToFundSlug: Record<string, FundSlug> = {}

Object.entries(btcpayFundSlugToStoreId).forEach(
  ([fundSlug, storeId]) => (btcpayStoreIdToFundSlug[storeId] = fundSlug as FundSlug)
)

export const fundSlugToCustomerIdAttr: Record<FundSlug, string> = {
  monero: 'stripeMoneroCustomerId',
  firo: 'stripeFiroCustomerId',
  privacy_guides: 'stripePgCustomerId',
  general: 'stripeGeneralCustomerId',
}

export function getFundSlugFromUrlPath(urlPath: string) {
  const fundSlug = urlPath.split('/')[1]

  return fundSlugs.includes(fundSlug as any) ? (fundSlug as FundSlug) : null
}
