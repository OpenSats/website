import markdownToHtml from '../utils/markdownToHtml'
import { getSingleFile } from '../utils/md'
import BigDumbMarkdown from '../components/BigDumbMarkdown'

export default function Faq({ content }: { content: string }) {
  return <BigDumbMarkdown content={content} />
}

export async function getStaticProps() {
  const md = getSingleFile('docs/faq.md')

  const content = await markdownToHtml(md || '')

  return {
    props: {
      content,
    },
  }
}
