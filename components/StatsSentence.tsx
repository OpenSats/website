import { useState, useEffect } from 'react'
import Link from '@/components/Link'
import PublicGoogleSheetsParser from 'public-google-sheets-parser'
import { formatNumber } from '@/components/LifetimeStats'
import {
  LIFETIME_STATS_SHEET_ID,
  type LifetimeStat,
} from '@/utils/lifetimeStats'

type StatsSentenceProps = {
  className?: string
  initialStats?: LifetimeStat[] | null
}

const skeleton = (
  <span className="inline-block h-[1em] w-12 animate-pulse rounded bg-stone-200 align-middle dark:bg-stone-700" />
)

export default function StatsSentence({
  className = '',
  initialStats,
}: StatsSentenceProps) {
  const [stats, setStats] = useState<LifetimeStat[]>(initialStats ?? [])

  useEffect(() => {
    const parser = new PublicGoogleSheetsParser(LIFETIME_STATS_SHEET_ID)
    parser.parse().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setStats(data as LifetimeStat[])
      }
    })
  }, [])

  // stats[0] = grants given, stats[1] = USD allocated, stats[2] = sats sent
  const grantsGiven = stats[0]?.value ? formatNumber(stats[0].value) : null
  const usdAllocated = stats[1]?.value
    ? Math.round(stats[1].value).toLocaleString()
    : null
  const satsSent = stats[2]?.value
    ? formatNumber(stats[2].value).replace('B', 'billion')
    : null

  return (
    <p className={className}>
      In total, OpenSats has allocated{' '}
      <Link
        href="/transparency"
        className="-mx-1 rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        {usdAllocated ? <>${usdAllocated} USD</> : <>{skeleton} USD</>}
      </Link>{' '}
      to free and open-source projects and sent{' '}
      <Link
        href="/transparency"
        className="-mx-1 whitespace-nowrap rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        {satsSent ? <>~{satsSent} sats</> : <>{skeleton} sats</>}
      </Link>{' '}
      to{' '}
      <Link
        href="/transparency"
        className="-mx-1 rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        {grantsGiven ? <>{grantsGiven} grantees</> : <>{skeleton} grantees</>}
      </Link>{' '}
      in{' '}
      <Link
        href="/map"
        className="-mx-1 whitespace-nowrap rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        40+ countries
      </Link>
      .
    </p>
  )
}
