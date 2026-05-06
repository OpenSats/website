import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import Link from '@/components/Link'
import StatsSentence from '@/components/StatsSentence'
import DonateRecurringButtonV2 from '@/components/DonateRecurringButtonV2'
import PaymentModal from '@/components/PaymentModal'
import { allFunds } from 'contentlayer/generated'
import type { Fund } from 'contentlayer/generated'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'

type FundsIndexProps = {
  funds: Fund[]
}

type FundConfig = {
  slug: 'general' | 'nostr' | 'ops'
  designation?: 'nostr' | 'ops'
  variant?: 'orange' | 'purple'
  preTagline: string
  tagline: string
}

const FUND_ORDER: FundConfig[] = [
  {
    slug: 'general',
    preTagline: 'Help us support',
    tagline: 'Bitcoin & FOSS',
  },
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

const FundsIndex: NextPage<FundsIndexProps> = ({ funds }) => {
  const [modalFund, setModalFund] = useState<Fund | undefined>(undefined)

  const closeModal = () => setModalFund(undefined)

  const sections = FUND_ORDER.map((cfg) => ({
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
        <StatsSentence className="pt-4 text-lg leading-7 text-gray-500 dark:text-gray-400" />
      </section>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {sections.map(({ cfg, fund }) => (
          <li key={fund.slug} className="py-10 first:pt-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                  {fund.title}
                </h2>
                <p className="pt-2 text-lg leading-7 text-gray-500 dark:text-gray-400">
                  {fund.summary}
                </p>
              </div>
              <DonateRecurringButtonV2
                designation={cfg.designation}
                variant={cfg.variant}
                preTagline={cfg.preTagline}
                tagline={cfg.tagline}
              />
              <div className="flex flex-wrap items-center gap-4 text-base font-medium leading-6">
                <button
                  onClick={() => setModalFund(fund)}
                  className="inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label={`Donate sats directly to the ${fund.title}`}
                >
                  <FontAwesomeIcon
                    icon={faBitcoin}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Donate sats directly &rarr;
                </button>
                <Link
                  href={`/funds/${fund.slug}`}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label={`Read more about the ${fund.title}`}
                >
                  Read the fund page &rarr;
                </Link>
                {fund.heartbeat && (
                  <Link
                    href={fund.heartbeat}
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    aria-label={`View ${fund.title} heartbeat`}
                  >
                    View heartbeat &rarr;
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end pt-4 text-base font-medium leading-6">
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
  return { props: { funds: allFunds } }
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
