import { Lora } from 'next/font/google'

const quoteFont = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['italic'],
  display: 'swap',
})

interface Props {
  quotes: string[]
}

/** Spread quotes evenly from 21% to 79% of the sidebar quote area. */
function getQuoteTopPercent(index: number, total: number) {
  if (total <= 1) {
    return 50
  }

  return 21 + (index * 58) / (total - 1)
}

export default function SpotlightPullQuotes({ quotes }: Props) {
  if (!quotes.length) {
    return null
  }

  return (
    <div className="relative hidden min-h-[32rem] w-full min-[1000px]:block min-[1000px]:flex-1">
      {quotes.map((quote, index) => (
        <blockquote
          key={quote}
          className={`absolute left-0 right-0 ${quoteFont.className}`}
          style={{ top: `${getQuoteTopPercent(index, quotes.length)}%` }}
        >
          <span
            className="block text-[6rem] leading-[0.55] text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="-mt-6 text-3xl font-normal leading-snug text-gray-800 dark:text-gray-200">
            {quote}
          </p>
        </blockquote>
      ))}
    </div>
  )
}
