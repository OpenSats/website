import { ReactNode } from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Newsletter } from 'contentlayer/generated'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { formatIssueNumber } from '@/utils/newsletter'

interface LayoutProps {
  content: CoreContent<Newsletter>
  children: ReactNode
}

export default function NewsletterLayout({ content, children }: LayoutProps) {
  const { title, issueNumber, date, quarter, headline, summary } = content
  const issueLabel = formatIssueNumber(issueNumber)
  const seoTitle = headline
    ? `${title} — ${quarter}: ${headline}`
    : `${title} — ${issueLabel}`

  return (
    <>
      <PageSEO title={seoTitle} description={summary} />
      <section className="mx-auto max-w-2xl px-2 sm:px-6 lg:px-0">
        <article>
          <header className="border-b border-gray-200 pb-8 pt-4 dark:border-gray-800">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Link
                href="/newsletter"
                className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {issueLabel}
              </Link>
              <span aria-hidden="true">·</span>
              <span>{quarter}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={date}>
                {formatDate(date, siteMetadata.locale)}
              </time>
            </div>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
              {title}
            </h1>
            {summary && (
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                {summary}
              </p>
            )}
          </header>

          <div className="newsletter-prose prose prose-lg max-w-none pb-16 pt-10 text-justify dark:prose-dark prose-headings:text-left prose-headings:font-serif prose-headings:font-semibold prose-h2:mt-12 prose-h2:text-3xl prose-h3:text-xl prose-a:text-primary-500 hover:prose-a:text-primary-600 dark:prose-a:text-primary-400 dark:hover:prose-a:text-primary-300 sm:text-left">
            {children}
          </div>
        </article>
      </section>
    </>
  )
}
