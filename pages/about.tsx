import markdownToHtml from '../utils/markdownToHtml'
import markdownStyles from '../components/markdown-styles.module.css'
import { getSingleFile } from '../utils/md'
import BigDumbMarkdown from '../components/BigDumbMarkdown'

export default function About({ content }: { content: string }) {
  return <BigDumbMarkdown content={content} />
}

export async function getStaticProps() {
  const md = getSingleFile('docs/about_us.md')

  const content = await markdownToHtml(md || '')

  return {
    props: {
      content,
    },
  }
}
