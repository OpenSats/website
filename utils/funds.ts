import { MONTHLY_DONATION_URL } from '@/utils/constants'

const FUND_DESIGNATION_IDS: Record<string, string> = {
  nostr: 'ENWRA6YZ',
  ops: 'ELL6P2J6',
}

const FUND_LABELS: Record<string, string> = {
  general: 'General Fund',
  nostr: 'The Nostr Fund',
  ops: 'Operations Budget',
}

export function getFundDonationUrl(fund: string): string {
  const designationId = FUND_DESIGNATION_IDS[fund]
  return designationId
    ? `${MONTHLY_DONATION_URL}?designationId=${designationId}`
    : MONTHLY_DONATION_URL
}

export function getFundLabel(fund: string): string {
  return FUND_LABELS[fund] || fund
}
