import { FundSlug } from '@prisma/client'
import sanitize from 'sanitize-filename'

import markdownToHtml from '../../utils/markdownToHtml'
import { fileExists, getSingleFile } from '../../utils/md'
import BigDumbMarkdown from '../../components/BigDumbMarkdown'
import { fundSlugs } from '../../utils/funds'

export default function About({ content }: { content: string }) {
  return <BigDumbMarkdown content={content} />
}

export async function getStaticProps({ params }: { params: { fund: FundSlug } }) {
  const md = getSingleFile(`docs/${sanitize(params.fund)}/apply_research.md`)

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
      .filter((fundSlug) => fileExists(`docs/${sanitize(fundSlug)}/apply_research.md`))
      .map((fundSlug) => `/${fundSlug}/apply_research`),
    fallback: true,
  }
}
