import CustomLink from './Link'

const APPLY_PATHS = {
  grant: '/apply',
  lts: '/apply/lts',
} as const

type ApplyTrack = keyof typeof APPLY_PATHS

type ApplyButtonProps = {
  prelude?: string
  cta?: string
  preTagline?: string
  tagline?: string
  track?: ApplyTrack
  href?: string
}

export default function ApplyButton({
  prelude = 'Click here to',
  cta = '>_ apply',
  preTagline = 'Apply for an',
  tagline = 'OpenSats grant',
  track = 'grant',
  href,
}: ApplyButtonProps) {
  const target = href ?? APPLY_PATHS[track]

  return (
    <CustomLink
      href={target}
      className="apply-banner-v2"
      aria-label={`${prelude} ${cta} — ${preTagline} ${tagline}`}
    >
      <span className="apply-banner-v2__left">
        <span className="apply-banner-v2__prelude">{prelude}</span>{' '}
        <strong>{cta}</strong>
      </span>
      <span className="apply-banner-v2__right">
        <span className="apply-banner-v2__tagline">
          {preTagline} <strong>{tagline}</strong>
        </span>
        <span className="apply-banner-v2__tagline-mobile">
          <strong>Apply</strong>
          <span className="apply-banner-v2__tagline-mobile-sub">
            for a grant
          </span>
        </span>
      </span>
      <span className="apply-banner-v2__icons" aria-hidden="true">
        <span>🟧</span>
        <span>🟧</span>
        <span>🟧</span>
      </span>
    </CustomLink>
  )
}
