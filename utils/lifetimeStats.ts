import { useEffect, useMemo, useRef, useState } from 'react'
import PublicGoogleSheetsParser from 'public-google-sheets-parser'

export type LifetimeStat = { label: string; value: number }

export const LIFETIME_STATS_SHEET_ID =
  '1mLEbHcrJibLN2PKxYq1LHJssq0CGuJRRoaZwot-ncZQ'

const DEFAULT_LIFETIME_STATS: LifetimeStat[] = [
  { label: 'Grants given', value: 404 },
  { label: 'USD allocated', value: 34668655 },
  { label: 'Sats sent', value: 39524655813 },
]

let lifetimeStatsPromise: Promise<LifetimeStat[] | null> | null = null

export function formatNumber(num: number): string {
  const abbreviations = ['k', 'M', 'B', 'T']
  let i = 0
  while (num > 1e3 && i < abbreviations.length) {
    num /= 1e3
    if (num < 1e3) {
      return `${num.toFixed(1)} ${abbreviations[i]}`
    }
    i += 1
  }
  return Math.round(num).toString()
}

function normalizeLifetimeStats(
  data: LifetimeStat[] | null | undefined,
  fallback: LifetimeStat[] = DEFAULT_LIFETIME_STATS
): LifetimeStat[] {
  return fallback.map((fallbackItem, index) => {
    const item = data?.[index]
    return {
      label:
        typeof item?.label === 'string' && item.label.length > 0
          ? item.label
          : fallbackItem.label,
      value: typeof item?.value === 'number' ? item.value : fallbackItem.value,
    }
  })
}

function createParser() {
  return new PublicGoogleSheetsParser(LIFETIME_STATS_SHEET_ID)
}

function getAnimationStartValue(targetValue: number): number {
  if (targetValue <= 0) return 0

  const halvedValue = targetValue / 2
  const digits = Math.max(Math.floor(halvedValue).toString().length, 1)
  const magnitude = 10 ** Math.max(digits - 2, 0)

  return Math.floor(halvedValue / magnitude) * magnitude
}

function createStartStats(targetStats: LifetimeStat[]): LifetimeStat[] {
  return targetStats.map((item) => ({
    label: item.label,
    value: getAnimationStartValue(item.value),
  }))
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}

function prefersReducedMotion(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function interpolateStats(
  startStats: LifetimeStat[],
  endStats: LifetimeStat[],
  progress: number
): LifetimeStat[] {
  const eased = easeOutCubic(progress)

  return endStats.map((targetItem, index) => {
    const startItem = startStats[index] ?? targetItem
    return {
      label: targetItem.label,
      value: Math.round(
        startItem.value + (targetItem.value - startItem.value) * eased
      ),
    }
  })
}

async function fetchLifetimeStats(): Promise<LifetimeStat[] | null> {
  try {
    const data = (await createParser().parse()) as LifetimeStat[]
    return Array.isArray(data) && data.length > 0
      ? normalizeLifetimeStats(data)
      : null
  } catch {
    return null
  }
}

/**
 * Fetches the OpenSats lifetime stats sheet (grants given, USD allocated,
 * sats sent) from Google Sheets. Returns null when the sheet is unreachable
 * so that build pipelines never fail on a transient network blip — the
 * client-side refresh inside the stats components will fill in the numbers
 * after hydration.
 */
export async function getLifetimeStats(): Promise<LifetimeStat[] | null> {
  if (typeof window === 'undefined') {
    return fetchLifetimeStats()
  }

  if (!lifetimeStatsPromise) {
    lifetimeStatsPromise = fetchLifetimeStats()
  }

  return lifetimeStatsPromise
}

export function useAnimatedLifetimeStats(
  initialStats?: LifetimeStat[] | null,
  durationMs = 1200
): LifetimeStat[] {
  const baseStats = useMemo(
    () => normalizeLifetimeStats(initialStats),
    [initialStats]
  )
  const [stats, setStats] = useState<LifetimeStat[]>(() =>
    createStartStats(baseStats)
  )
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const startStats = createStartStats(baseStats)
    setStats(startStats)

    let cancelled = false

    const animateTo = (targetStats: LifetimeStat[]) => {
      if (prefersReducedMotion()) {
        setStats(targetStats)
        return
      }

      const startTime = performance.now()

      const step = (now: number) => {
        if (cancelled) return

        const progress = Math.min((now - startTime) / durationMs, 1)
        setStats(interpolateStats(startStats, targetStats, progress))

        if (progress < 1) {
          frameRef.current = window.requestAnimationFrame(step)
        }
      }

      frameRef.current = window.requestAnimationFrame(step)
    }

    getLifetimeStats().then((fetchedStats) => {
      if (cancelled) return
      animateTo(normalizeLifetimeStats(fetchedStats, baseStats))
    })

    return () => {
      cancelled = true
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [baseStats, durationMs])

  return stats
}
