import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import Link from '@/components/Link'
import Image from '@/components/Image'
import StatsSentence from '@/components/StatsSentence'
import DonateRecurringButtonV2 from '@/components/DonateRecurringButtonV2'
import PaymentModal from '@/components/PaymentModal'
import { allFunds } from 'contentlayer/generated'
import type { Fund } from 'contentlayer/generated'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { MONTHLY_DONATION_URL } from '@/utils/constants'
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
}

const PRIMARY_FUND_CONFIG: FundConfig = {
  slug: 'general',
  preTagline: 'Help us support',
  tagline: 'Bitcoin & FOSS',
}

const SECONDARY_FUND_CONFIGS: FundConfig[] = [
  {
    slug: 'nostr',
    designation: 'nostr',
    variant: 'purple',
    preTagline: 'Help us support',
    tagline: 'Nostr development',
  },
  {
    slug: 'ops',
    designation: 'ops',
    preTagline: 'Help us keep',
    tagline: 'OpenSats running',
  },
]

const DESIGNATION_IDS = { nostr: 'ENWRA6YZ', ops: 'ELL6P2J6' } as const

function getMonthlyDonationUrl(cfg: FundConfig): string {
  return cfg.designation
    ? `${MONTHLY_DONATION_URL}?designationId=${
        DESIGNATION_IDS[cfg.designation]
      }`
    : MONTHLY_DONATION_URL
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
          the General Fund and the Nostr Fund goes to grantees. Our own bills
          are paid out of a separate Operations Budget.
        </p>
        <StatsSentence
          initialStats={lifetimeStats}
          className="pt-4 text-lg leading-7 text-gray-500 dark:text-gray-400"
        />
      </section>

      {primaryFund && (
        <section className="items-start py-10 xl:grid xl:grid-cols-3 xl:gap-x-8">
          <div className="hidden pt-2 xl:flex xl:justify-center">
            <Image
              src={primaryFund.coverImage}
              alt={primaryFund.title}
              width={210}
              height={210}
              className="h-40 w-40"
            />
          </div>
          <div className="flex flex-col gap-4 xl:col-span-2">
            <div>
              <h2 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                {primaryFund.title}
              </h2>
              <p className="pt-2 text-lg leading-7 text-gray-500 dark:text-gray-400">
                {primaryFund.summary}
              </p>
            </div>
            <DonateRecurringButtonV2
              prelude=""
              designation={PRIMARY_FUND_CONFIG.designation}
              variant={PRIMARY_FUND_CONFIG.variant}
              preTagline={PRIMARY_FUND_CONFIG.preTagline}
              tagline={PRIMARY_FUND_CONFIG.tagline}
            />
            <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-base font-medium leading-6">
              <button
                onClick={() => setModalFund(primaryFund)}
                className="inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label={`Donate sats directly to the ${primaryFund.title}`}
              >
                <FontAwesomeIcon
                  icon={faBitcoin}
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Donate sats directly &rarr;
              </button>
              <Link
                href={`/funds/${primaryFund.slug}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label={`Read more about the ${primaryFund.title}`}
              >
                Read the fund page &rarr;
              </Link>
              {primaryFund.heartbeat && (
                <Link
                  href={primaryFund.heartbeat}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label={`View ${primaryFund.title} heartbeat`}
                >
                  View heartbeat &rarr;
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {secondaryFunds.length > 0 && (
        <section className="border-t border-gray-200 pt-10 dark:border-gray-700">
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Designate your gift
          </h2>
          <p className="pt-1 text-base text-gray-500 dark:text-gray-400">
            Earmark a recurring donation for a specific fund instead.
          </p>
          <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
            {secondaryFunds.map(({ cfg, fund }) => (
              <article
                key={fund.slug}
                className="flex gap-4 rounded-xl bg-stone-100 p-4 dark:bg-stone-900"
              >
                <Image
                  src={fund.coverImage}
                  alt={fund.title}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-lg"
                />
                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-lg font-bold">{fund.title}</h3>
                  <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {fund.summary}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm font-medium leading-6">
                    <Link
                      href={getMonthlyDonationUrl(cfg)}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Donate monthly to ${fund.title}`}
                    >
                      Donate monthly &rarr;
                    </Link>
                    <Link
                      href={`/funds/${fund.slug}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Read more about ${fund.title}`}
                    >
                      Read the fund page &rarr;
                    </Link>
                  </div>
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
          aria-label="Browse all funded projects"
        >
          Browse all funded projects &rarr;
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
