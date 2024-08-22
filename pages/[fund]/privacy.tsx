import { FundSlug } from '@prisma/client'
import markdownToHtml from '../../utils/markdownToHtml'
import { getSingleFile } from '../../utils/md'
import BigDumbMarkdown from '../../components/BigDumbMarkdown'
import { fundSlugs } from '../../utils/funds'

export default function Terms({ content }: { content: string }) {
  return <BigDumbMarkdown content={content} />
}

export async function getStaticProps({ params }: { params: { fund: FundSlug } }) {
  const md = getSingleFile(`docs/${params.fund}/privacy.md`)

  const content = await markdownToHtml(md || '')

  return {
    props: {
      content,
    },
  }
}

export function getStaticPaths() {
  return {
    paths: fundSlugs.map((fund) => `/${fund}/privacy`),
    fallback: true,
  }
}
