import { useEffect, useMemo, useRef, useState } from 'react'
import PublicGoogleSheetsParser from 'public-google-sheets-parser'

export type LifetimeStat = { label: string; value: number }

export const LIFETIME_STATS_SHEET_ID =
  '1mLEbHcrJibLN2PKxYq1LHJssq0CGuJRRoaZwot-ncZQ'

export const DEFAULT_LIFETIME_STATS: LifetimeStat[] = [
  { label: 'Grants given', value: 319 },
  { label: 'USD allocated', value: 27400000 },
  { label: 'Sats sent', value: 31200000000 },
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

export function formatLifetimeStatDisplay(
  index: number,
  value: number
): string {
  const formatted = formatNumber(value)
  if (index === 1) return `$ ${formatted}`
  if (index === 2) return `~${formatted}`
  return formatted
}

/** Matches the country count shown in StatsSentence (`40+ countries`). */
export const STATS_COUNTRY_COUNT = 40

export function formatStatsSentenceValues(stats: LifetimeStat[]) {
  return {
    grantsGiven: formatNumber(stats[0]?.value ?? 0),
    usdAllocated: Math.round(stats[1]?.value ?? 0).toLocaleString(),
    satsSent: formatNumber(stats[2]?.value ?? 0).replace('B', 'billion'),
    countryCount: STATS_COUNTRY_COUNT,
  }
}

export function formatMapOgSentence(stats: LifetimeStat[]): string {
  return formatMapOgSentenceSegments(stats)
    .map((segment) => segment.text)
    .join('')
}

export function formatMapOgSentenceSegments(
  stats: LifetimeStat[]
): Array<{ text: string; highlight: boolean }> {
  const { satsSent, grantsGiven, countryCount } =
    formatStatsSentenceValues(stats)

  return [
    { text: 'OpenSats has sent ', highlight: false },
    { text: `~${satsSent} sats`, highlight: true },
    { text: ' to ', highlight: false },
    { text: `${grantsGiven} grantees`, highlight: true },
    { text: ' in ', highlight: false },
    { text: `${countryCount}+ countries`, highlight: true },
  ]
}

function coerceStatValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim())
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

export function normalizeLifetimeStats(
  data: LifetimeStat[] | null | undefined,
  fallback: LifetimeStat[] = DEFAULT_LIFETIME_STATS
): LifetimeStat[] {
  return fallback.map((fallbackItem, index) => {
    const item = data?.[index]
    const coercedValue = coerceStatValue(item?.value)

    return {
      label:
        typeof item?.label === 'string' && item.label.length > 0
          ? item.label
          : fallbackItem.label,
      value: coercedValue ?? fallbackItem.value,
    }
  })
}

function createParser() {
  return new PublicGoogleSheetsParser(LIFETIME_STATS_SHEET_ID)
}

function getAnimationStartValue(targetValue: number): number {
  if (targetValue <= 0) return 0

  return targetValue * 0.79
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
      value: startItem.value + (targetItem.value - startItem.value) * eased,
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

/** Build-time helper: always returns a full stats array, using defaults on fetch failure. */
export async function resolveLifetimeStats(): Promise<LifetimeStat[]> {
  return normalizeLifetimeStats(await getLifetimeStats())
}

export function useAnimatedCount(
  targetValue: number,
  durationMs = 1200
): number {
  const [value, setValue] = useState(() => getAnimationStartValue(targetValue))
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = getAnimationStartValue(targetValue)
    setValue(startValue)

    if (prefersReducedMotion()) {
      setValue(targetValue)
      return
    }

    const startTime = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1)
      const eased = easeOutCubic(progress)
      setValue(startValue + (targetValue - startValue) * eased)

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(step)
      }
    }

    frameRef.current = window.requestAnimationFrame(step)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [targetValue, durationMs])

  return value
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
