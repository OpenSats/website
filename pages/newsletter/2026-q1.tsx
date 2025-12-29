import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

const impactReports = [
  {
    title: 'Advancements in Nostr Clients',
    date: 'December 2025',
    slug: 'advancements-in-nostr-clients',
    image: '/static/images/blog/88-advancements-in-nostr-clients.jpg',
    summary:
      'Seven nostr clients—Amethyst, Coracle, Damus, Jumble, NoStrudel, Nostur, and Zap.stream—advancing decentralized social networking with outbox models, encrypted messaging, and Lightning zaps.',
    highlights: [
      'Outbox model enabling 1,000+ relay connections',
      'NIP-17 private messaging across clients',
      'Mobile live streaming with Lightning integration',
    ],
    tag: 'nostr',
  },
  {
    title: 'Advancements in Bitcoin & Lightning Wallets',
    date: 'October 2025',
    slug: 'advancements-in-bitcoin-and-lightning-wallets',
    image: '/static/images/blog/86-advancements-in-bitcoin-and-lightning-wallets.jpg',
    summary:
      'Six wallet projects—Bitcoin Safe, Blixt, Blitz, Clams, Cove, and Satsigner—making self-custody more practical and secure.',
    highlights: [
      'Compact Block Filters for privacy',
      'Lightning Box for trust-minimized addresses',
      'Hardware wallet integration & coin control',
    ],
    tag: 'wallets',
  },
  {
    title: 'Advancements in Ecash',
    date: 'September 2025',
    slug: 'advancements-in-ecash',
    image: '/static/images/blog/84-advancements-in-ecash.jpg',
    summary:
      'Nine ecash initiatives—including Cashu, CDK, Fedimint, and more—building privacy-preserving payment infrastructure on Bitcoin.',
    highlights: [
      'Mobile bindings for iOS & Android',
      'Offline ecash transfers',
      'Lightning Address integration via npub.cash',
    ],
    tag: 'ecash',
  },
  {
    title: 'Advancements in Developer Libraries',
    date: 'August 2025',
    slug: 'advancements-in-developer-libraries',
    image: '/static/images/blog/82-advancements-in-developer-libraries.jpg',
    summary:
      'Seven foundational libraries—BDK, rust-bitcoin, secp256k1, and more—providing the building blocks for Bitcoin development.',
    highlights: [
      'BDK 1.0 stable release',
      'Payjoin V2 (BIP 77) in production',
      'Splicing implementation across LDK & CLN',
    ],
    tag: 'libraries',
  },
  {
    title: 'Advancements in Developer Training',
    date: 'June 2025',
    slug: 'advancements-in-developer-training',
    image: '/static/images/blog/79-advancements-in-developer-training.jpg',
    summary:
      'Four education initiatives—Summer of Bitcoin, Africa Free Routing, Bitcoin Dev Launchpad, and Bitshala—training hundreds of new contributors.',
    highlights: [
      '800+ students completed code challenges',
      '35% of alumni now working in Bitcoin',
      'Lightning bootcamps across 3 African countries',
    ],
    tag: 'education',
  },
  {
    title: 'Advancements in Lightning Infrastructure',
    date: 'April 2025',
    slug: 'advancements-in-lightning-infrastructure',
    image: '/static/images/blog/74-advancements-in-lightning-infrastructure.jpg',
    summary:
      'Five Lightning projects—Splicing, VLS, BLAST, Lampo, and Lnprototest—improving the speed, security, and interoperability of the Lightning Network.',
    highlights: [
      'Splicing interoperability across implementations',
      'VLS enabling enterprise-grade security',
      'BLAST testing all 3 major LN implementations',
    ],
    tag: 'lightning',
  },
  {
    title: 'Advancements in On-Chain Privacy',
    date: 'February 2025',
    slug: 'developing-advancements-in-onchain-privacy',
    image: '/static/images/blog/70-developing-advancements-in-onchain-privacy.jpg',
    summary:
      'Three privacy initiatives—Async Payjoin, Coinswap, and Silent Payments—disrupting transaction surveillance and enabling financial sovereignty.',
    highlights: [
      'Bull Bitcoin: first Async Payjoin wallet',
      'Coinswap v0.1.0 beta released',
      'Silent Payments progressing in Bitcoin Core',
    ],
    tag: 'privacy',
  },
]

export default function Newsletter2026Q1() {
  return (
    <>
      <Head>
        <title>OpenSats Q1 2026 Newsletter - Year in Review</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="A look back at 2025's impact reports and the open-source developers advancing Bitcoin, Lightning, nostr, and freedom tech."
        />
      </Head>

      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Gradient Background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-orange-500/5 blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 py-12">
          {/* Header */}
          <header className="mb-16 text-center">
            <Link href="/" className="mb-8 inline-block">
              <Image
                src="/logo.svg"
                alt="OpenSats"
                width={56}
                height={56}
                className="opacity-90 transition-opacity hover:opacity-100"
              />
            </Link>
            <div className="mb-4">
              <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-orange-400">
                Quarterly Newsletter
              </span>
            </div>
            <h1 className="mb-3 font-serif text-5xl font-light tracking-tight text-white md:text-6xl">
              Q1 2026
            </h1>
            <p className="text-lg text-zinc-500">
              A Year of Open-Source Impact
            </p>
          </header>

          {/* Intro */}
          <section className="mb-16">
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur-sm">
              <p className="mb-4 text-lg leading-relaxed text-zinc-300">
                Welcome to our first quarterly newsletter of 2026. As we begin a
                new year, we want to look back at the incredible progress made
                by our grantees throughout 2025.
              </p>
              <p className="text-lg leading-relaxed text-zinc-300">
                Last year, we published{' '}
                <strong className="text-white">seven impact reports</strong>{' '}
                covering advances in privacy, Lightning infrastructure,
                developer training, libraries, ecash, wallets, and nostr
                clients. These reports document the work of{' '}
                <strong className="text-white">
                  dozens of open-source contributors
                </strong>{' '}
                who are building the foundations of financial freedom.
              </p>
            </div>
          </section>

          {/* Monthly Donation CTA - Primary */}
          <section className="mb-16">
            <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-8 md:p-10">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full bg-orange-500/20 blur-3xl" />
              <div className="relative">
                <h2 className="mb-3 font-serif text-2xl text-white md:text-3xl">
                  Sustain This Work
                </h2>
                <p className="mb-6 max-w-xl text-zinc-400">
                  Every project in this newsletter exists because of donors like
                  you. Monthly donations provide the{' '}
                  <strong className="text-zinc-300">
                    predictable funding
                  </strong>{' '}
                  that allows developers to focus on long-term improvements
                  rather than short-term survival.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/monthly"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 font-semibold text-black transition-all hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-500/25"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Become a Monthly Supporter
                  </Link>
                  <Link
                    href="/donate"
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-6 py-3.5 font-semibold text-white transition-colors hover:border-zinc-600 hover:bg-zinc-800/50"
                  >
                    One-Time Donation
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 2025 Stats */}
          <section className="mb-16">
            <h2 className="mb-8 text-center font-serif text-2xl text-white">
              2025 By The Numbers
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { value: '7', label: 'Impact Reports' },
                { value: '40+', label: 'Projects Featured' },
                { value: '300+', label: 'Total Grants' },
                { value: '∞', label: 'Lines of FOSS Code' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5 text-center"
                >
                  <p className="font-mono text-3xl font-bold text-orange-500">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Impact Reports Grid */}
          <section className="mb-16">
            <div className="mb-8 flex items-center gap-4">
              <h2 className="font-serif text-2xl text-white">
                2025 Impact Reports
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>

            <div className="space-y-6">
              {impactReports.map((report, index) => (
                <article
                  key={report.slug}
                  className="group overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/20 transition-colors hover:border-zinc-700/50"
                >
                  <div className="md:flex">
                    <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-56">
                      <Image
                        src={report.image}
                        alt={report.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent md:bg-gradient-to-r" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-zinc-900/80 px-2.5 py-1 font-mono text-xs text-zinc-400 backdrop-blur-sm md:bottom-auto md:left-auto md:right-3 md:top-3">
                        {report.date}
                      </span>
                    </div>
                    <div className="flex-1 p-5 md:p-6">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold leading-snug text-white">
                          {report.title}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-xs ${
                            report.tag === 'nostr'
                              ? 'bg-purple-500/10 text-purple-400'
                              : report.tag === 'wallets'
                              ? 'bg-blue-500/10 text-blue-400'
                              : report.tag === 'ecash'
                              ? 'bg-green-500/10 text-green-400'
                              : report.tag === 'libraries'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : report.tag === 'education'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : report.tag === 'lightning'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {report.tag}
                        </span>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                        {report.summary}
                      </p>
                      <ul className="mb-4 space-y-1">
                        {report.highlights.map((highlight, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-zinc-500"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-500/60" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/blog/${report.slug}`}
                        className="inline-flex items-center gap-1.5 font-mono text-sm text-orange-500 transition-colors hover:text-orange-400"
                      >
                        Read Full Report
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Quote Section */}
          <section className="mb-16">
            <blockquote className="relative rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8">
              <svg
                className="absolute left-6 top-6 h-8 w-8 text-orange-500/20"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>
              <p className="relative pl-8 text-lg italic leading-relaxed text-zinc-300">
                The future of Lightning as a scalable, permissionless payment
                system depends on continued open-source innovation and
                collaboration. OpenSats remains committed to funding the
                builders pushing Bitcoin's technology forward.
              </p>
            </blockquote>
          </section>

          {/* Monthly Donation CTA - Secondary */}
          <section className="mb-16">
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-8 text-center">
              <h2 className="mb-3 font-serif text-2xl text-white">
                Your Monthly Gift = Their Full-Time Focus
              </h2>
              <p className="mx-auto mb-6 max-w-lg text-zinc-400">
                When you donate monthly, you're not just contributing
                funds—you're giving developers the stability to work on
                hard problems that take months or years to solve.
              </p>
              <div className="mb-6 flex justify-center gap-4">
                {['$21', '$100', '$500', 'Custom'].map((amount) => (
                  <span
                    key={amount}
                    className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 font-mono text-sm text-zinc-300"
                  >
                    {amount}
                    {amount !== 'Custom' && (
                      <span className="text-zinc-500">/mo</span>
                    )}
                  </span>
                ))}
              </div>
              <Link
                href="/monthly"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-4 text-lg font-semibold text-black transition-all hover:bg-orange-400"
              >
                Start Your Monthly Donation
              </Link>
              <p className="mt-4 text-sm text-zinc-500">
                OpenSats is a 501(c)(3) public charity. All donations are tax
                deductible.
              </p>
            </div>
          </section>

          {/* Looking Ahead */}
          <section className="mb-16">
            <h2 className="mb-6 font-serif text-2xl text-white">
              Looking Ahead to 2026
            </h2>
            <div className="space-y-4 text-zinc-400">
              <p>
                The work highlighted in these reports shows open-source Bitcoin
                development maturing rapidly. Projects are moving from
                experimental prototypes into production-ready tools that people
                use every day.
              </p>
              <p>
                In 2026, we'll continue publishing quarterly impact reports
                covering the work of our grantees. Expect updates on:
              </p>
              <ul className="ml-4 space-y-2">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                  <span>
                    <strong className="text-zinc-300">Bitcoin Core</strong> —
                    Silent Payments integration, Cluster Mempool, and more
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                  <span>
                    <strong className="text-zinc-300">Lightning</strong> —
                    Splicing adoption, bolt12, and LSP improvements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                  <span>
                    <strong className="text-zinc-300">Nostr</strong> —
                    Decentralized identity, relay economics, and new use cases
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                  <span>
                    <strong className="text-zinc-300">Education</strong> —
                    Expanding developer pipelines globally
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Final CTA */}
          <section className="mb-12 overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent p-8 text-center md:p-12">
            <h2 className="mb-4 font-serif text-3xl text-white md:text-4xl">
              Fund the Future of Freedom Tech
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-zinc-300">
              Every project in this newsletter was made possible by donors who
              believe in open-source development. Join them.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/monthly"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-4 text-lg font-bold text-black transition-all hover:bg-orange-400 hover:shadow-xl hover:shadow-orange-500/30"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Donate Monthly
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                Apply for Funding
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-zinc-800/50 pt-8 text-center">
            <div className="mb-6 flex justify-center gap-6">
              <Link
                href="https://twitter.com/OpenSats"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                Twitter
              </Link>
              <Link
                href="https://njump.to/npub10pensatlcfwktnvjjw2dtem38n6rvw8g6fv73h84cuacxn4c28eqyfn34f"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                Nostr
              </Link>
              <Link
                href="https://github.com/OpenSats"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                GitHub
              </Link>
              <Link
                href="/blog"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                Blog
              </Link>
            </div>
            <p className="mb-2 text-sm text-zinc-500">
              OpenSats Initiative, Inc. is a 501(c)(3) public charity.
            </p>
            <p className="font-mono text-xs text-zinc-600">
              © 2026 OpenSats. Built with ♥ and open-source software.
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}

