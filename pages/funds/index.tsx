import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { PageActionButton, PageActionLink } from '@/components/PageAction'
import StatsSentence from '@/components/StatsSentence'
import DonateRecurringButtonV2 from '@/components/DonateRecurringButtonV2'
import PaymentModal from '@/components/PaymentModal'
import { allFunds } from 'contentlayer/generated'
import type { Fund } from 'contentlayer/generated'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight, faRepeat } from '@fortawesome/free-solid-svg-icons'
import { getFundDonationUrl } from '@/utils/funds'
import { getLifetimeStats, type LifetimeStat } from '@/utils/lifetimeStats'

type FundsIndexProps = {
  funds: Fund[]
  lifetimeStats: LifetimeStat[] | null
}

type FundConfig = {
  slug: 'general' | 'nostr' | 'ops'
  designation?: 'nostr' | 'ops'
  variant?: 'orange' | 'purple'
  preTagline: string
  tagline: string
  /**
   * Page-specific blurb shown on /funds. Kept here (not in MDX
   * frontmatter) so og-images, SEO descriptions, and other downstream
   * consumers of `summary` stay untouched.
   */
  blurb?: string
  /**
   * Optional cover shown only on /funds. Does not replace Contentlayer
   * `coverImage` (fund pages, OG art, PaymentModal, etc. stay unchanged).
   */
  fundsIndexCoverImage?: string
  fundsIndexCoverImageDark?: string
}

const PRIMARY_FUND_CONFIG: FundConfig = {
  slug: 'general',
  preTagline: 'Help us support',
  tagline: 'Bitcoin & FOSS',
  blurb:
    'Pays grants to Bitcoin developers and the FOSS projects Bitcoin depends on. Anyone can donate. 100% of donations go to grantees.',
  fundsIndexCoverImage: '/static/images/funds/general-fund-index-light.svg',
  fundsIndexCoverImageDark: '/static/images/funds/general-fund-index-dark.svg',
}

const SECONDARY_FUND_CONFIGS: FundConfig[] = [
  {
    slug: 'nostr',
    designation: 'nostr',
    variant: 'purple',
    preTagline: 'Help us support',
    tagline: 'Nostr development',
    blurb:
      'Pays grants to relay operators, client developers, library maintainers, designers, and protocol-level contributors working on nostr.',
  },
  {
    slug: 'ops',
    designation: 'ops',
    preTagline: 'Help us keep',
    tagline: 'OpenSats running',
    blurb:
      'Contributions to the OpenSats Operations Budget are used to cover our operating expenses as we continue to facilitate frictionless, tax-deductible donations from the community to the Bitcoin & FOSS ecosystems at a pass-through rate of 100%.',
  },
]

type FundActionRowProps = {
  fund: Fund
  cfg: FundConfig
  onDonate: () => void
}

function FundActionRow({ fund, cfg, onDonate }: FundActionRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-6">
      <PageActionButton
        onClick={onDonate}
        layout="mobileSquareDesktopText"
        aria-label={`Donate sats directly to ${fund.title}`}
        title="Donate sats"
      >
        <FontAwesomeIcon
          icon={faBitcoin}
          className="h-[1.125rem] w-[1.125rem]"
          aria-hidden="true"
        />
        <span className="hidden sm:inline">Donate sats directly</span>
      </PageActionButton>
      <PageActionLink
        href={getMonthlyDonationUrl(cfg)}
        layout="mobileSquareDesktopText"
        aria-label={`Donate monthly to ${fund.title}`}
        title="Donate monthly"
      >
        <FontAwesomeIcon
          icon={faRepeat}
          className="h-4 w-4"
          aria-hidden="true"
        />
        <span className="hidden sm:inline">Donate monthly</span>
      </PageActionLink>
      <PageActionLink
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

function getMonthlyDonationUrl(cfg: FundConfig): string {
  return getFundDonationUrl(cfg.designation ?? cfg.slug)
}

const FundsIndex: NextPage<FundsIndexProps> = ({ funds, lifetimeStats }) => {
  const [modalFund, setModalFund] = useState<Fund | undefined>(undefined)
  const closeModal = () => setModalFund(undefined)

  const primaryFund = funds.find((f) => f.slug === PRIMARY_FUND_CONFIG.slug)
  const secondaryFunds = SECONDARY_FUND_CONFIGS.map((cfg) => ({
    cfg,
    fund: funds.find((f) => f.slug === cfg.slug),
  })).filter((s): s is { cfg: FundConfig; fund: Fund } => Boolean(s.fund))

  return (
    <>
      <Head>
        <title>OpenSats | Funds</title>
      </Head>
      <section className="pt-4 md:pb-8">
        <h1 className="py-2 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 max-[375px]:text-2xl sm:text-3xl sm:leading-10 md:py-4 md:text-5xl md:leading-14 lg:text-6xl">
          Make the most of your donation
        </h1>
        <p className="text-xl leading-7 text-gray-500 dark:text-gray-400">
          OpenSats is a 501(c)(3) public charity. 100% of every sat donated to
          our open-source funds goes to grantees. Our own bills are paid out of
          a separate Operations Budget.
        </p>
        <StatsSentence
          initialStats={lifetimeStats}
          className="pt-4 text-lg leading-7 text-gray-500 dark:text-gray-400"
        />
      </section>

      {primaryFund && (
        <section className="items-start py-10 xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div className="hidden pt-2 xl:block">
            <div className="flex justify-center">
              <Image
                src={
                  PRIMARY_FUND_CONFIG.fundsIndexCoverImage ??
                  primaryFund.coverImage
                }
                darkSrc={PRIMARY_FUND_CONFIG.fundsIndexCoverImageDark}
                alt={primaryFund.title}
                width={210}
                height={210}
                className="h-40 w-40 rounded-2xl"
              />
            </div>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-4 xl:col-span-2 xl:col-start-2">
            <div>
              <h2 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                {primaryFund.title}
              </h2>
              <p className="pt-2 text-lg leading-7 text-gray-500 dark:text-gray-400">
                {PRIMARY_FUND_CONFIG.blurb ?? primaryFund.summary}
              </p>
            </div>
            <DonateRecurringButtonV2
              preTagline={PRIMARY_FUND_CONFIG.preTagline}
              tagline={PRIMARY_FUND_CONFIG.tagline}
            />
            <div className="space-y-3 text-base leading-7 text-gray-500 dark:text-gray-400">
              <p>
                Past grants have paid for security research, privacy
                improvements, scaling proposals and implementations,
                contributors and maintainers of bitcoin-core, hardware wallets,
                ecash projects, fuzz testing, wallets, developer tooling, as
                well as translation and education work. The board reads every
                application that comes in and funds work that materially
                improves Bitcoin or the open-source projects it depends on.
              </p>
              <p>
                Payout totals, bylaws, and year-end reports live on our{' '}
                <Link
                  href="/transparency"
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  transparency page
                </Link>
                . If you file taxes in the US, your gift may count as a
                tax-deductible donation to a 501(c)(3).
              </p>
            </div>
            <FundActionRow
              fund={primaryFund}
              cfg={PRIMARY_FUND_CONFIG}
              onDonate={() => setModalFund(primaryFund)}
            />
          </div>
        </section>
      )}

      {secondaryFunds.length > 0 && (
        <section className="border-t border-gray-200 pt-10 dark:border-gray-700">
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            <span className="sm:hidden">Designate your gift</span>
            <span className="hidden sm:inline">
              Designate your donation to a specific fund
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
            {secondaryFunds.map(({ cfg, fund }) => (
              <article
                key={fund.slug}
                className="flex flex-col gap-3 rounded-xl bg-stone-100 p-4 dark:bg-stone-900"
              >
                <div className="flex gap-4">
                  <Image
                    src={fund.coverImage}
                    alt={fund.title}
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 rounded-lg"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="text-lg font-bold">{fund.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cfg.blurb ?? fund.summary}
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <FundActionRow
                    fund={fund}
                    cfg={cfg}
                    onDonate={() => setModalFund(fund)}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end pt-8 text-base font-medium leading-6">
        <Link
          href="/projects/showcase"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          aria-label="Showcase of funded projects"
        >
          Showcase of funded projects &rarr;
        </Link>
      </div>

      <PaymentModal
        isOpen={Boolean(modalFund)}
        onRequestClose={closeModal}
        fund={modalFund}
      />
    </>
  )
}

export default FundsIndex

export const getStaticProps: GetStaticProps<FundsIndexProps> = async () => {
  const lifetimeStats = await getLifetimeStats()
  return {
    props: { funds: allFunds, lifetimeStats },
    revalidate: 60 * 60 * 12,
  }
}

export function isOpenSatsProject(project: { nym: string }): boolean {
  return project.nym === 'OpenSats'
}

export function isNotOpenSatsProject(project: { nym: string }): boolean {
  return !isOpenSatsProject(project)
}

export function isShowcaseProject(project: {
  nym: string
  showcase?: boolean
}): boolean {
  return isNotOpenSatsProject(project) && Boolean(project.showcase)
}
