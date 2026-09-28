import { getStaticPaths, getStaticProps } from '../../pages/newsletter/[slug]'

jest.mock('../../.contentlayer/generated', () => ({
  allNewsletters: [{ slug: '2026-Q1', title: 'Sats Well Spent' }],
}))
jest.mock('pliny/mdx-components', () => ({ MDXLayoutRenderer: () => null }))
jest.mock('@/components/MDXComponents', () => ({ MDXComponents: {} }))

it('builds only canonical paths to avoid filename case collisions', async () => {
  expect(await getStaticPaths()).toEqual({
    paths: [{ params: { slug: '2026-Q1' } }],
    fallback: 'blocking',
  })
})

it('redirects lowercase URLs to the canonical issue URL', async () => {
  expect(await getStaticProps({ params: { slug: '2026-q1' } })).toEqual({
    redirect: { destination: '/newsletter/2026-Q1', permanent: true },
  })
})

it('renders canonical issues and returns 404 for unknown issues', async () => {
  expect(await getStaticProps({ params: { slug: '2026-Q1' } })).toEqual({
    props: { issue: { slug: '2026-Q1', title: 'Sats Well Spent' } },
  })
  expect(await getStaticProps({ params: { slug: 'missing' } })).toEqual({
    notFound: true,
  })
})
