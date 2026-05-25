interface Props {
  quotes: string[]
}

export default function SpotlightPullQuotes({ quotes }: Props) {
  if (!quotes.length) {
    return null
  }

  return (
    <div className="hidden min-[1000px]:flex min-[1000px]:flex-col min-[1000px]:gap-24 min-[1000px]:py-12">
      {quotes.map((quote) => (
        <blockquote
          key={quote}
          className="border-l-4 border-primary-500 pl-4 not-italic"
        >
          <p className="text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100">
            {quote}
          </p>
        </blockquote>
      ))}
    </div>
  )
}
