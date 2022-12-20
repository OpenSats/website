import markdownToHtml from '../utils/markdownToHtml'
import { getSingleFile } from '../utils/md'
import BigDumbMarkdown from '../components/BigDumbMarkdown'

export default function About({ content }: { content: string }) {
  return <BigDumbMarkdown content={content} />
}

export async function getStaticProps() {
  const md = getSingleFile('docs/apply_research.md')

  const content = await markdownToHtml(md || '')

  return {
    props: {
      content,
    },
  }
}
