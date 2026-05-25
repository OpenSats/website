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
        <blockquote key={quote} className="relative not-italic pl-10">
          <span
            className="absolute left-0 top-0 font-serif text-6xl leading-none text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100">
            {quote}
          </p>
        </blockquote>
      ))}
    </div>
  )
}
