import DonateRecurringButtonV2 from './DonateRecurringButtonV2'

type DonateRecurringButtonDesignation = 'nostr' | 'ops'

type DonateRecurringButtonProps = {
  label?: string
  showHeart?: boolean
  designation?: DonateRecurringButtonDesignation
}

export default function DonateRecurringButton({
  label = 'Give Monthly',
  designation,
}: DonateRecurringButtonProps) {
  const variant = designation === 'nostr' ? 'purple' : 'orange'

  const fundSpecificCopy =
    designation === 'nostr'
      ? {
          preTagline: 'Help us support',
          tagline: 'Nostr development',
        }
      : designation === 'ops'
      ? {
          preTagline: 'Help us keep',
          tagline: 'OpenSats running',
        }
      : {}

  const customCta = label !== 'Give Monthly' ? { cta: label } : {}

  return (
    <DonateRecurringButtonV2
      designation={designation}
      variant={variant}
      {...fundSpecificCopy}
      {...customCta}
    />
  )
}
