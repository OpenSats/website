import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export const SCORES_URL = 'https://slop.opensats.org/api/scores'
export const SCORES_FILE = path.join(
  process.cwd(),
  '.cache/human-writing-scores.json'
)

type Scores = Record<string, number>

export function parseScores(value: unknown): Scores {
  const data = value as { version?: unknown; scores?: unknown }
  if (
    !data ||
    data.version !== 1 ||
    !data.scores ||
    typeof data.scores !== 'object' ||
    Array.isArray(data.scores)
  ) {
    throw new Error('Invalid scores response')
  }
  const entries = Object.entries(data.scores)
  if (
    entries.some(
      ([key, score]) =>
        !/^(blog|newsletter)\/[a-zA-Z0-9/-]+$/.test(key) ||
        typeof score !== 'number' ||
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100
    )
  ) {
    throw new Error('Invalid score value')
  }
  return Object.fromEntries(entries) as Scores
}

/** A fresh snapshot per build. Failure replaces any previous snapshot with no scores. */
export async function refreshHumanWritingScores({
  url = SCORES_URL,
  file = SCORES_FILE,
  fetchImpl = fetch,
  warn = console.warn,
}: {
  url?: string
  file?: string
  fetchImpl?: typeof fetch
  warn?: (message: string) => void
} = {}): Promise<number> {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify({ version: 1, scores: {} }))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const scores = parseScores(await response.json())
    writeFileSync(file, JSON.stringify({ version: 1, scores }))
    return Object.keys(scores).length
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error'
    warn(
      `[human-writing] Scores unavailable (${reason}); building without article badges or human-written labels.`
    )
    return 0
  } finally {
    clearTimeout(timer)
  }
}

/** Used only by getStaticProps; never fetches from the detector. */
export function getHumanWritingScore(articlePath: string): number {
  try {
    const scores = parseScores(JSON.parse(readFileSync(SCORES_FILE, 'utf8')))
    return scores[articlePath] ?? 0
  } catch {
    return 0
  }
}
