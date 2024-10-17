import { unified } from 'unified'
import rehypeStringify from 'rehype-stringify'
import remarkSanitize from 'rehype-sanitize'
import remarkRehype from 'remark-rehype'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(remarkSanitize)
    .process(markdown)

  return result.toString()
}
