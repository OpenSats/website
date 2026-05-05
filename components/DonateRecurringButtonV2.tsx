import CustomLink from './Link'
import { MONTHLY_DONATION_URL } from '@/utils/constants'

const DESIGNATION_IDS: Record<string, string> = {
  nostr: 'ENWRA6YZ',
  ops: 'ELL6P2J6',
}

type DonateRecurringButtonV2Variant = 'orange' | 'purple'

type DonateRecurringButtonV2Props = {
  prelude?: string
  cta?: string
  preTagline?: string
  tagline?: string
  designation?: keyof typeof DESIGNATION_IDS
  variant?: DonateRecurringButtonV2Variant
}

export default function DonateRecurringButtonV2({
  prelude = 'Click here to',
  cta = '>_ donate',
  preTagline = 'Help us provide',
  tagline = 'sustainable funding',
  designation,
  variant = 'orange',
}: DonateRecurringButtonV2Props) {
  const designationId = designation ? DESIGNATION_IDS[designation] : undefined
  const href = designationId
    ? `${MONTHLY_DONATION_URL}?designationId=${designationId}`
    : MONTHLY_DONATION_URL

  const className =
    variant === 'purple'
      ? 'donate-banner-v2 donate-banner-v2--purple'
      : 'donate-banner-v2'
  const heart = variant === 'purple' ? '💜' : '🧡'

  return (
    <CustomLink
      href={href}
      className={className}
      aria-label={`${prelude} ${cta} ${preTagline} ${tagline}`}
    >
      <span className="donate-banner-v2__left">
        <span className="donate-banner-v2__prelude">{prelude}</span>{' '}
        <strong>{cta}</strong>
      </span>
      <span className="donate-banner-v2__right">
        <span className="donate-banner-v2__tagline">
          {preTagline} <strong>{tagline}</strong>
        </span>
        <span className="donate-banner-v2__tagline-mobile">
          <strong>Monthly</strong>
          <span className="donate-banner-v2__tagline-mobile-sub">
            or give once
          </span>
        </span>
      </span>
      <span className="donate-banner-v2__hearts" aria-hidden="true">
        <span>{heart}</span>
        <span>{heart}</span>
        <span>{heart}</span>
      </span>
    </CustomLink>
  )
}
