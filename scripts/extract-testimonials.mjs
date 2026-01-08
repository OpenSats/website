import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const BLOG_DIR = './data/blog'
const OUTPUT_FILE = './testimonials.md'
const BASE_URL = 'https://opensats.org/blog'

/**
 * Convert a heading text to a URL slug
 * e.g., "Bitcoin Safe" -> "bitcoin-safe"
 */
function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .trim()
}

/**
 * Find the section heading that contains a given position in the content
 */
function findSectionAtPosition(content, position) {
  const lines = content.substring(0, position).split('\n')

  // Search backwards for the nearest heading
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(/^#{2,3}\s+(.+)$/)
    if (match) {
      return toSlug(match[1])
    }
  }
  return null
}

async function extractTestimonials() {
  const files = await readdir(BLOG_DIR)
  const mdxFiles = files.filter((f) => f.endsWith('.mdx'))

  let output = '# Testimonials\n\n'
  let totalCount = 0

  for (const file of mdxFiles.sort()) {
    const content = await readFile(join(BLOG_DIR, file), 'utf-8')
    const slug = file.replace('.mdx', '')

    // Find all quotes with <cite> tags
    const quoteRegex = /((?:^>.*\n)+?(?:^>.*<cite>.*<\/cite>))/gm
    let match

    while ((match = quoteRegex.exec(content)) !== null) {
      const quote = match[0]
      const position = match.index

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

      // Find the section this quote belongs to
      const section = findSectionAtPosition(content, position)
      const url = section
        ? `${BASE_URL}/${slug}#${section}`
        : `${BASE_URL}/${slug}`

      output += `> ${cleanQuote.split('\n').join('\n> ')}\n\n`
      output += `—${name}\n\n`
      output += `*Source: ${url}*\n\n---\n\n`
      totalCount++
    }
  }

  await writeFile(OUTPUT_FILE, output)
  console.log(`✓ Extracted ${totalCount} testimonials to ${OUTPUT_FILE}`)
}

extractTestimonials().catch(console.error)
