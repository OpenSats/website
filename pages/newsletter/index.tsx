import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

const newsletters = [
  {
    quarter: 'Q1 2026',
    title: 'A Year of Open-Source Impact',
    description:
      'A comprehensive look back at 2025, featuring seven impact reports covering privacy, Lightning, ecash, wallets, nostr clients, developer libraries, and education.',
    href: '/newsletter/2026-q1',
    date: 'January 2026',
  },
]

export default function NewsletterIndex() {
  return (
    <>
      <Head>
        <title>Newsletter Archive | OpenSats</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Quarterly newsletters from OpenSats, summarizing the impact of our grantees across the Bitcoin and open-source ecosystem."
        />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Gradient Background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-orange-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 py-12">
          {/* Header */}
          <header className="mb-12 text-center">
            <Link href="/" className="mb-8 inline-block">
              <Image
                src="/img/project/opensats_logo.png"
                alt="OpenSats"
                width={72}
                height={72}
                className="opacity-90 transition-opacity hover:opacity-100"
              />
            </Link>
            <h1 className="mb-3 font-serif text-4xl font-light tracking-tight text-white md:text-5xl">
              Newsletter Archive
            </h1>
            <p className="text-lg text-zinc-500">
              Quarterly impact summaries from OpenSats
            </p>
          </header>

          {/* Newsletter List */}
          <section className="mb-16">
            <div className="space-y-4">
              {newsletters.map((newsletter) => (
                <Link
                  key={newsletter.href}
                  href={newsletter.href}
                  className="group block rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700/50 hover:bg-zinc-900/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="mb-2 inline-block rounded-full bg-orange-500/10 px-3 py-1 font-mono text-xs text-orange-400">
                        {newsletter.quarter}
                      </span>
                      <h2 className="mb-2 text-xl font-semibold text-white group-hover:text-orange-400">
                        {newsletter.title}
                      </h2>
                      <p className="text-sm text-zinc-400">
                        {newsletter.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-zinc-600 transition-colors group-hover:text-orange-500">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">{newsletter.date}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Subscribe CTA */}
          <section className="mb-12 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-8 text-center">
            <h2 className="mb-3 font-serif text-2xl text-white">
              Stay Updated
            </h2>
            <p className="mb-6 text-zinc-400">
              Want to receive our quarterly newsletters? Follow us on nostr or
              Twitter to stay in the loop.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="https://njump.to/npub10pensatlcfwktnvjjw2dtem38n6rvw8g6fv73h84cuacxn4c28eqyfn34f"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-500"
              >
                Follow on Nostr
              </Link>
              <Link
                href="https://twitter.com/OpenSats"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-white transition-colors hover:border-zinc-600 hover:bg-zinc-800"
              >
                Follow on Twitter
              </Link>
            </div>
          </section>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to OpenSats
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

