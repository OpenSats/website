import Link from '@/components/Link'
import {
  formatStatsSentenceValues,
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
  const { grantsGiven, usdAllocated, satsSent, countryCount } =
    formatStatsSentenceValues(stats)
  const animatedCountryCount = Math.round(useAnimatedCount(countryCount))

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
        {animatedCountryCount}+ countries
      </Link>
      .
    </p>
  )
}
