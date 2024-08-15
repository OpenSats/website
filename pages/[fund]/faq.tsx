import xss from 'xss'

import markdownToHtml from '../../utils/markdownToHtml'
import { getSingleFile } from '../../utils/md'
import BigDumbMarkdown from '../../components/BigDumbMarkdown'
import { FundSlug, fundSlugs } from '../../utils/funds'

export default function Faq({ content }: { content: string }) {
  return (
    <article
      className="prose max-w-3xl mx-auto pb-8 pt-8 dark:prose-dark xl:col-span-2"
      dangerouslySetInnerHTML={{ __html: xss(content || '') }}
    />
  )
}

export async function getStaticProps({ params }: { params: { fund: FundSlug } }) {
  const md = getSingleFile(`docs/${params.fund}/faq.md`)

  const content = await markdownToHtml(md || '')

  return {
    props: {
      content,
    },
  }
}

export function getStaticPaths() {
  return {
    paths: fundSlugs.map((fund) => `/${fund}/faq`),
    fallback: true,
  }
}
