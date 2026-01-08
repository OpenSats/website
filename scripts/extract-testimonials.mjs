import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const BLOG_DIR = './data/blog'
const OUTPUT_FILE = './testimonials.md'

async function extractTestimonials() {
  const files = await readdir(BLOG_DIR)
  const mdxFiles = files.filter((f) => f.endsWith('.mdx'))

  let output = '# Testimonials\n\n'
  let totalCount = 0

  for (const file of mdxFiles.sort()) {
    const content = await readFile(join(BLOG_DIR, file), 'utf-8')

    // Match blockquotes that contain <cite> - handles multi-line quotes
    const quoteRegex = /((?:^>.*\n)+?(?:^>.*<cite>.*<\/cite>))/gm
    const matches = content.match(quoteRegex)

    if (matches) {
      for (const quote of matches) {
        // Extract the citation name
        const citeMatch = quote.match(/<cite>[—–-]?\s*(.+?)<\/cite>/)
        const name = citeMatch
          ? citeMatch[1].replace(/\[|\]/g, '').trim()
          : 'Unknown'

        // Clean up the quote text
        const cleanQuote = quote
          .replace(/^>\s?/gm, '') // Remove > prefixes
          .replace(/<cite>.*<\/cite>/, '') // Remove cite tag
          .trim()

        output += `## ${name}\n\n`
        output += `> ${cleanQuote.split('\n').join('\n> ')}\n\n`
        output += `*Source: ${file}*\n\n---\n\n`
        totalCount++
      }
    }
  }

  await writeFile(OUTPUT_FILE, output)
  console.log(`✓ Extracted ${totalCount} testimonials to ${OUTPUT_FILE}`)
}

extractTestimonials().catch(console.error)
