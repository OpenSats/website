import DonateRecurringButtonV2 from './DonateRecurringButtonV2'

type DonateRecurringButtonDesignation = 'nostr' | 'ops' | 'red'

type DonateRecurringButtonProps = {
  label?: string
  showHeart?: boolean
  designation?: DonateRecurringButtonDesignation
}

export default function DonateRecurringButton({
  label = 'Give Monthly',
  designation,
}: DonateRecurringButtonProps) {
  const variant =
    designation === 'nostr' ? 'purple' : designation === 'red' ? 'red' : 'orange'

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
      : designation === 'red'
      ? {
          preTagline: 'Help us support',
          tagline: 'red teaming',
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
