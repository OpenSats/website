import { Lora } from 'next/font/google'

const quoteFont = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['italic'],
  display: 'swap',
})

const QUOTE_RANGE = { start: 21, end: 79 } as const

interface Props {
  quotes: string[]
}

/** Evenly distribute quote tops from 21% to 79% based on count. */
function getQuoteTopPercents(total: number): number[] {
  if (total <= 0) {
    return []
  }

  if (total === 1) {
    return [(QUOTE_RANGE.start + QUOTE_RANGE.end) / 2]
  }

  const span = QUOTE_RANGE.end - QUOTE_RANGE.start

  return Array.from(
    { length: total },
    (_, index) => QUOTE_RANGE.start + (index * span) / (total - 1)
  )
}

/** Taller quote lists need more vertical room so blocks do not overlap. */
function getQuoteAreaMinHeight(total: number): string {
  return `${Math.max(28, total * 9)}rem`
}

export default function SpotlightPullQuotes({ quotes }: Props) {
  if (!quotes.length) {
    return null
  }

  const topPercents = getQuoteTopPercents(quotes.length)

  return (
    <div
      className="relative hidden w-full min-[1000px]:block min-[1000px]:flex-1 xl:pr-4"
      style={{ minHeight: getQuoteAreaMinHeight(quotes.length) }}
    >
      {quotes.map((quote, index) => (
        <blockquote
          key={quote}
          className={`absolute left-0 right-0 ${quoteFont.className}`}
          style={{ top: `${topPercents[index]}%` }}
        >
          <span
            className="block text-[4.5rem] leading-[0.55] text-gray-300 dark:text-gray-600 xl:text-[6rem]"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="-mt-4 text-pretty text-xl font-normal leading-snug text-gray-800 dark:text-gray-200 xl:-mt-6 xl:text-3xl">
            {quote}
          </p>
        </blockquote>
      ))}
    </div>
  )
}
