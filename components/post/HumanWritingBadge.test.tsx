import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import PostArticleBody from './PostArticleBody'
import NewsletterLayout from '@/layouts/NewsletterLayout'

jest.mock('next/dynamic', () => () => () => null)
jest.mock('pliny/comments', () => ({ Comments: () => null }))
jest.mock('pliny/utils/formatDate', () => ({
  formatDate: () => 'November 12, 2026',
}))
jest.mock('@/components/SEO', () => ({ NewsletterSEO: () => null }))
jest.mock('@/components/post/SpotlightPullQuotes', () => () => null)

const article = {
  path: 'blog/example',
  slug: 'example',
  filePath: 'blog/example.mdx',
  tags: [],
} as ComponentProps<typeof PostArticleBody>['content']

const issue = {
  slug: '2026-Q3',
  title: 'Example',
  issueNumber: 3,
  date: '2026-10-31',
  quarter: '2026-Q3',
  filePath: 'newsletter/2026-Q3.mdx',
} as ComponentProps<typeof NewsletterLayout>['content']

it.each([
  [true, 95, true],
  [true, 94.999, false],
  [true, undefined, false],
  [false, 100, true],
  [false, undefined, false],
])(
  'gates badges and claims for spotlight=%s, score=%s',
  (spotlight, score, expected) => {
    render(
      <PostArticleBody
        content={{ ...article, humanWrittenScore: score }}
        authorDetails={[]}
        spotlight={spotlight}
      >
        Article body
      </PostArticleBody>
    )
    expect(
      !!screen.queryByRole('link', {
        name: '100% human slop: about our writing',
      })
    ).toBe(expected)
    expect(!!screen.queryByText('Written by humans.')).toBe(expected)
    expect(screen.getByText('Article body')).toBeInTheDocument()
  }
)

it.each([
  [95, true],
  [94.999, false],
  [undefined, false],
])('gates newsletter badges and claims for score=%s', (score, expected) => {
  render(
    <NewsletterLayout
      content={{ ...issue, humanWrittenScore: score as number | undefined }}
    >
      Newsletter body
    </NewsletterLayout>
  )
  expect(
    !!screen.queryByRole('link', { name: '100% human slop: about our writing' })
  ).toBe(expected)
  expect(!!screen.queryByText('Written by humans.')).toBe(expected)
})
