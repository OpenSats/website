import markdownToHtml from '../utils/markdownToHtml'
import { getSingleFile } from '../utils/md'
import BigDumbMarkdown from '../components/BigDumbMarkdown'
import xss from 'xss'

export default function Faq({ content }: { content: string }) {
  return (
    <article
      className="prose max-w-3xl mx-auto pb-8 pt-8 dark:prose-dark xl:col-span-2"
      dangerouslySetInnerHTML={{ __html: xss(content || '') }}
    />
  )
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
