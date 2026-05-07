import Link from '@/components/Link'
import {
  formatNumber,
  type LifetimeStat,
  useAnimatedCount,
  useAnimatedLifetimeStats,
} from '@/utils/lifetimeStats'

type StatsSentenceProps = {
  className?: string
  initialStats?: LifetimeStat[] | null
}

export default function StatsSentence({
  className = '',
  initialStats,
}: StatsSentenceProps) {
  const stats = useAnimatedLifetimeStats(initialStats)

  // stats[0] = grants given, stats[1] = USD allocated, stats[2] = sats sent
  const grantsGiven = formatNumber(stats[0]?.value ?? 0)
  const usdAllocated = Math.round(stats[1]?.value ?? 0).toLocaleString()
  const satsSent = formatNumber(stats[2]?.value ?? 0).replace('B', 'billion')
  const countryCount = Math.round(useAnimatedCount(40))

  return (
    <p className={className}>
      In total, OpenSats has allocated{' '}
      <Link
        href="/transparency"
        className="-mx-1 rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        ${usdAllocated} USD
      </Link>{' '}
      to free and open-source projects and sent{' '}
      <Link
        href="/transparency"
        className="-mx-1 whitespace-nowrap rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        ~{satsSent} sats
      </Link>{' '}
      to{' '}
      <Link
        href="/transparency"
        className="-mx-1 rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        {grantsGiven} grantees
      </Link>{' '}
      in{' '}
      <Link
        href="/map"
        className="-mx-1 whitespace-nowrap rounded bg-primary-100/50 px-1 no-underline hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
      >
        {countryCount}+ countries
      </Link>
      .
    </p>
  )
}
