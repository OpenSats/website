import xss from 'xss'
import { FundSlug } from '@prisma/client'

import markdownToHtml from '../../utils/markdownToHtml'
import { fileExists, getSingleFile } from '../../utils/md'
import { fundSlugs } from '../../utils/funds'

export default function About({ content }: { content: string }) {
  return (
    <article
      className="prose max-w-3xl mx-auto pb-8 pt-8 xl:col-span-2"
      dangerouslySetInnerHTML={{ __html: xss(content || '') }}
    />
  )
}

export async function getStaticProps({ params }: { params: { fund: FundSlug } }) {
  const md = getSingleFile(`docs/${params.fund}/about_us.md`)

  const content = await markdownToHtml(md || '')

  return {
    props: {
      content,
    },
  }
}

export function getStaticPaths() {
  return {
    paths: fundSlugs
      .filter((fundSlug) => fileExists(`docs/${fundSlug}/about.md`))
      .map((fundSlug) => `/${fundSlug}/about`),
    fallback: true,
  }
}
