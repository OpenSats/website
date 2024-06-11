import xss from 'xss'

import markdownToHtml from '../utils/markdownToHtml'
import { getSingleFile } from '../utils/md'

export default function About({ content }: { content: string }) {
  return (
    <article
      className="prose max-w-3xl mx-auto pb-8 pt-8 dark:prose-dark xl:col-span-2"
      dangerouslySetInnerHTML={{ __html: xss(content || '') }}
    />
  )
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
