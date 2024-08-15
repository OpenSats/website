import markdownToHtml from '../../utils/markdownToHtml'
import { getSingleFile } from '../../utils/md'
import BigDumbMarkdown from '../../components/BigDumbMarkdown'
import { FundSlug, fundSlugs } from '../../utils/funds'

export default function About({ content }: { content: string }) {
  return <BigDumbMarkdown content={content} />
}

export async function getStaticProps({ params }: { params: { fund: FundSlug } }) {
  const md = getSingleFile(`docs/${params.fund}/apply_research.md`)

  const content = await markdownToHtml(md || '')

  return {
    props: {
      content,
    },
  }
}

export function getStaticPaths() {
  return {
    paths: fundSlugs.map((fund) => `/${fund}/apply_research`),
    fallback: true,
  }
}
