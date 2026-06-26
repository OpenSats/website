import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import LifetimeStats from '@/components/LifetimeStats'
import { resolveLifetimeStats, type LifetimeStat } from '@/utils/lifetimeStats'

const DEFAULT_LAYOUT = 'PageLayout'

type TransparencyProps = {
  page: NonNullable<ReturnType<typeof allPages.find>>
  lifetimeStats: LifetimeStat[]
}

export const getStaticProps: GetStaticProps<TransparencyProps> = async () => {
  const page = allPages.find((p) => p.slug === 'transparency')
  if (!page) {
    return { notFound: true }
  }

  const lifetimeStats = await resolveLifetimeStats()

  return {
    props: { page, lifetimeStats },
    revalidate: 60 * 60 * 12,
  }
}

export default function Transparency({
  page,
  lifetimeStats,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const components = {
    ...MDXComponents,
    LifetimeStats: () => <LifetimeStats initialStats={lifetimeStats} />,
  }

  return (
    <MDXLayoutRenderer
      layout={page.layout || DEFAULT_LAYOUT}
      content={page}
      MDXComponents={components}
    />
  )
}
