import { useState } from 'react'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { PageActionButton, PageActionLink } from '@/components/PageAction'
import PaymentModal from '@/components/PaymentModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight, faRepeat } from '@fortawesome/free-solid-svg-icons'
import { allFunds } from 'contentlayer/generated'
import type { Fund } from 'contentlayer/generated'
import { getFundDonationUrl } from '@/utils/funds'

export type FundCardDesignation = 'nostr' | 'ops' | 'red'

export type FundCardProps = {
  fund: Fund
  blurb?: string
  designation?: FundCardDesignation
  /**
   * Secondary fund cards use compact square donate actions.
   * The primary General Fund card on /funds uses text labels on desktop.
   */
  compactActions?: boolean
  onDonate: () => void
  className?: string
}

type FundActionRowProps = {
  fund: Fund
  designation?: FundCardDesignation
  compactActions?: boolean
  onDonate: () => void
}

export function FundActionRow({
  fund,
  designation,
  compactActions = true,
  onDonate,
}: FundActionRowProps) {
  const monthlyHref = getFundDonationUrl(designation ?? fund.slug)

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-6">
      <PageActionButton
        variant="outlineMuted"
        onClick={onDonate}
        layout={compactActions ? 'square' : 'mobileSquareDesktopText'}
        aria-label={`Donate sats directly to ${fund.title}`}
        title="Donate sats"
      >
        <FontAwesomeIcon
          icon={faBitcoin}
          className="h-6 w-6"
          aria-hidden="true"
        />
        {!compactActions && (
          <span className="hidden sm:inline">Donate sats directly</span>
        )}
      </PageActionButton>
      <PageActionLink
        variant="outlineMuted"
        href={monthlyHref}
        layout={compactActions ? 'square' : 'mobileSquareDesktopText'}
        aria-label={`Donate monthly to ${fund.title}`}
        title="Donate monthly"
      >
        <FontAwesomeIcon
          icon={faRepeat}
          className="h-4 w-4"
          aria-hidden="true"
        />
        {!compactActions && (
          <span className="hidden sm:inline">Donate monthly</span>
        )}
      </PageActionLink>
      <PageActionLink
        variant="outlineMuted"
        href={`/funds/${fund.slug}`}
        layout="mobileSquareDesktopText"
        aria-label={`Learn more about ${fund.title}`}
        title={`Learn more about ${fund.title}`}
      >
        <FontAwesomeIcon
          icon={faArrowRight}
          className="h-4 w-4 sm:hidden"
          aria-hidden="true"
        />
        <span className="hidden sm:inline">Learn more</span>
      </PageActionLink>
    </div>
  )
}

export function FundCard({
  fund,
  blurb,
  designation,
  compactActions = true,
  onDonate,
  className,
}: FundCardProps) {
  return (
    <article
      className={[
        'flex flex-col gap-3 rounded-xl bg-stone-100 p-4 dark:bg-stone-900',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex gap-4">
        <Link
          href={`/funds/${fund.slug}`}
          aria-label={`View ${fund.title}`}
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900"
        >
          <Image
            src={fund.coverImage}
            alt={fund.title}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-lg"
          />
        </Link>
        <Link
          href={`/funds/${fund.slug}`}
          className="flex flex-1 flex-col gap-1 rounded-lg transition-colors duration-150 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:hover:text-primary-400 dark:focus-visible:ring-offset-stone-900"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {fund.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {blurb ?? fund.summary}
          </p>
        </Link>
      </div>
      <div className="mt-auto">
        <FundActionRow
          fund={fund}
          designation={designation}
          compactActions={compactActions}
          onDonate={onDonate}
        />
      </div>
    </article>
  )
}

export const FUND_CARD_BLURBS: Partial<Record<string, string>> = {
  red: 'Funding for people red teaming critical Bitcoin software, including reimbursement of past LLM token costs.',
  nostr:
    'Pays grants to relay operators, client developers, library maintainers, designers, and protocol-level contributors working on nostr.',
  ops: 'Contributions to the OpenSats Operations Budget are used to cover our operating expenses as we continue to facilitate frictionless, tax-deductible donations from the community to the Bitcoin & FOSS ecosystems at a pass-through rate of 100%.',
}

type FundCardEmbedProps = {
  slug: FundCardDesignation
}

/**
 * Self-contained fund card for MDX embeds (includes PaymentModal).
 */
export default function FundCardEmbed({ slug }: FundCardEmbedProps) {
  const fund = allFunds.find((f) => f.slug === slug)
  const [modalOpen, setModalOpen] = useState(false)

  if (!fund) return null

  return (
    <div className="not-prose my-10 w-full max-w-md sm:max-w-lg">
      <FundCard
        fund={fund}
        blurb={FUND_CARD_BLURBS[slug]}
        designation={slug}
        onDonate={() => setModalOpen(true)}
      />
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        fund={fund}
      />
    </div>
  )
}
