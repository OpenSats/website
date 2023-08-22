import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import DesignTeam from '@/components/DesignTeam'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'nostr')
  const designTeam = allAuthors
    .filter((p) => p.design === true)
    .sort(() => Math.random() - 0.5)
  return { props: { page, designTeam } }
}

export default function Nostr({
  page,
  designTeam,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <MDXLayoutRenderer
        layout={page.layout || DEFAULT_LAYOUT}
        content={page}
        MDXComponents={MDXComponents}
      />
      <DesignTeam members={designTeam} />
    </>
  )
}
