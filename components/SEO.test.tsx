import type { ComponentProps } from 'react'
import { render } from '@testing-library/react'
import { BlogSEO } from './SEO'
import siteMetadata from '@/data/siteMetadata'

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}))
jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/blog/spotlight' }),
}))

const post = {
  title: 'Spotlight',
  summary: 'A developer spotlight',
  date: '2026-09-28',
  slug: 'spotlight',
  url: `${siteMetadata.siteUrl}/blog/spotlight`,
} as ComponentProps<typeof BlogSEO>

it('serves generated cards in OG, Twitter, and article data in source order', () => {
  const { container } = render(
    <BlogSEO {...post} images={['/featured.png', '/hero.jpg']} />
  )
  const urls = [0, 1].map(
    (index) =>
      `${siteMetadata.siteUrl}/static/images/blog/og/spotlight-${index}.jpg`
  )
  const images = [...container.querySelectorAll('meta[property="og:image"]')]
  expect(images.map((image) => image.getAttribute('content'))).toEqual(urls)
  for (const image of images) {
    expect(image.nextElementSibling).toHaveAttribute(
      'property',
      'og:image:width'
    )
    expect(image.nextElementSibling).toHaveAttribute('content', '1200')
    expect(image.nextElementSibling?.nextElementSibling).toHaveAttribute(
      'content',
      '630'
    )
  }
  expect(container.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    urls[0]
  )
  const article = JSON.parse(
    container.querySelector('script')?.textContent || '{}'
  )
  expect(article.image.map(({ url }) => url)).toEqual(urls)
})

it('uses the existing brand fallback for a post without images', () => {
  const { container } = render(<BlogSEO {...post} />)
  expect(container.querySelector('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`
  )
})

it('preserves remote image URLs without claiming local dimensions', () => {
  const { container } = render(
    <BlogSEO
      {...post}
      images={['https://example.com/card.jpg', '//example.com/hero.jpg']}
    />
  )
  expect(container.querySelector('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://example.com/card.jpg'
  )
  expect(container.querySelector('meta[property="og:image:width"]')).toBeNull()
})
