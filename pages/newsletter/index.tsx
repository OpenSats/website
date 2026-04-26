import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { allNewsletters } from 'contentlayer/generated'
import type { Newsletter } from 'contentlayer/generated'
import { allCoreContent } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import SectionContainer from '@/components/SectionContainer'
import NewsletterSignup from '@/components/NewsletterSignup'
import siteMetadata from '@/data/siteMetadata'

type Issue = ReturnType<typeof allCoreContent<Newsletter>>[number]

type Props = {
  issues: Issue[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const sorted = [...allNewsletters].sort((a, b) => {
    if (a.issueNumber !== b.issueNumber) {
      return b.issueNumber - a.issueNumber
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return {
    props: {
      issues: allCoreContent(sorted) as Issue[],
    },
  }
}

export default function NewsletterIndexPage({
  issues,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title={`Newsletter - ${siteMetadata.title}`}
        description="Sats Well Spent — quarterly dispatches from OpenSats. Signals, numbers, and software shipped."
      />
      <SectionContainer>
        <div className="mx-auto max-w-2xl">
          <header className="space-y-4 pb-10 pt-4">
            <p className="font-mono text-xs uppercase tracking-wider text-primary-500 dark:text-primary-400">
              Sats Well Spent
            </p>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
              Newsletter
            </h1>
            <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
              A quarterly dispatch from inside the sat-dispensing machine —
              signals, numbers, sats sent and received, and notable software
              shipped by our grantees.
            </p>
          </header>

          <div className="border-t border-gray-200 dark:border-gray-800">
            {issues.length === 0 ? (
              <p className="py-10 text-gray-600 dark:text-gray-400">
                The first issue is on its way.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {issues.map((issue) => {
                  const issueLabel = `Issue #${String(
                    issue.issueNumber
                  ).padStart(2, '0')}`
                  return (
                    <li key={issue.slug} className="py-8">
                      <Link
                        href={`/newsletter/${issue.slug}`}
                        className="group block"
                      >
                        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <span className="text-primary-500 dark:text-primary-400">
                            {issueLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{issue.quarter}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={issue.date}>
                            {formatDate(issue.date, siteMetadata.locale)}
                          </time>
                        </div>
                        <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-gray-900 group-hover:text-primary-500 dark:text-gray-100 dark:group-hover:text-primary-400 sm:text-3xl">
                          {issue.title}
                        </h2>
                        {issue.summary && (
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {issue.summary}
                          </p>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="pb-16 pt-12">
            <NewsletterSignup />
          </div>
        </div>
      </SectionContainer>
    </>
  )
}
