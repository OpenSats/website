import CustomLink from './Link'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

const DESIGNATION_IDS: Record<string, string> = {
  nostr: 'ENWRA6YZ',
  ops: 'ELL6P2J6',
}

type DonateRecurringButtonV2Props = {
  prelude?: string
  cta?: string
  preTagline?: string
  tagline?: string
  designation?: keyof typeof DESIGNATION_IDS
}

export default function DonateRecurringButtonV2({
  prelude = 'Click here to',
  cta = '>_ donate',
  preTagline = 'Help us provide',
  tagline = 'sustainable funding',
  designation,
}: DonateRecurringButtonV2Props) {
  const designationId = designation ? DESIGNATION_IDS[designation] : undefined
  const href = designationId
    ? `${MONTHLY_DONATION_URL}?designationId=${designationId}`
    : MONTHLY_DONATION_URL

  return (
    <CustomLink
      href={href}
      className="donate-banner-v2"
      aria-label={`${prelude} ${cta} ${preTagline} ${tagline}`}
    >
      <span className="donate-banner-v2__left">
        {prelude} <strong>{cta}</strong>
      </span>
      <span className="donate-banner-v2__right">
        {preTagline} <strong>{tagline}</strong>
      </span>
      <span className="donate-banner-v2__hearts" aria-hidden="true">
        <span>🧡</span>
        <span>🧡</span>
        <span>🧡</span>
      </span>
    </CustomLink>
  )
}
