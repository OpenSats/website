import { useState, useEffect } from 'react'
import Link from '@/components/Link'
import PublicGoogleSheetsParser from 'public-google-sheets-parser'
import { formatNumber } from '@/components/LifetimeStats'

type StatsSentenceProps = {
  className?: string
}

export default function StatsSentence({ className = '' }: StatsSentenceProps) {
  const [stats, setStats] = useState<{ label: string; value: number }[]>([])

  useEffect(() => {
    const parser = new PublicGoogleSheetsParser(
      '1mLEbHcrJibLN2PKxYq1LHJssq0CGuJRRoaZwot-ncZQ'
    )
    parser.parse().then((data) => {
      setStats(data)
    })
  }, [])

  // stats[0] = grants given, stats[1] = USD allocated, stats[2] = sats sent
  const grantsGiven = stats[0]?.value ? formatNumber(stats[0].value) : '...'
  const usdAllocated = stats[1]?.value
    ? Math.round(stats[1].value).toLocaleString()
    : '...'
  const satsSent = stats[2]?.value
    ? formatNumber(stats[2].value).replace('B', 'billion')
    : '...'

  return (
    <p className={className}>
      OpenSats has allocated{' '}
      <Link
        href="/transparency"
        className="-mx-1 rounded bg-primary-100/50 px-1 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        ${usdAllocated} USD
      </Link>{' '}
      to free and open-source projects and sent{' '}
      <Link
        href="/transparency"
        className="-mx-1 whitespace-nowrap rounded bg-primary-100/50 px-1 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        ~{satsSent} sats
      </Link>{' '}
      to{' '}
      <Link
        href="/transparency"
        className="-mx-1 rounded bg-primary-100/50 px-1 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        {grantsGiven} grantees
      </Link>{' '}
      in{' '}
      <Link
        href="/map"
        className="-mx-1 whitespace-nowrap rounded bg-primary-500 px-2 font-bold text-white hover:bg-primary-600 hover:text-white dark:text-white"
      >
        40+ countries.
      </Link>
    </p>
  )
}
