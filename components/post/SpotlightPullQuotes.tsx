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

/** Place quotes at 10%, 30%, 50%, … down the sidebar quote area. */
function getQuoteTopPercent(index: number) {
  return Math.min(10 + index * 20, 90)
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
          style={{ top: `${getQuoteTopPercent(index)}%` }}
        >
          <span
            className="block text-8xl leading-none text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="mt-2 text-3xl font-normal leading-snug text-gray-800 dark:text-gray-200">
            {quote}
          </p>
        </blockquote>
      ))}
    </div>
  )
}
