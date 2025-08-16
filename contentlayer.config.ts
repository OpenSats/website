import {
  defineDocumentType,
  ComputedFields,
  makeSource,
} from 'contentlayer/source-files'
import readingTime from 'reading-time'
import path from 'path'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'

const root = process.cwd()

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'string', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'list', of: { type: 'string' } },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },
  computedFields,
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    nym: { type: 'string' },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    nostr: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
    board: { type: 'boolean' },
    ops: { type: 'boolean' },
    design: { type: 'boolean' },
    volunteer: { type: 'boolean' },
  },
  computedFields,
}))

export const Pages = defineDocumentType(() => ({
  name: 'Pages',
  filePathPattern: 'pages/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    summary: { type: 'string' },
    image: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

export const Projects = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: 'projects/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    dateAdded: { type: 'date', required: true },
    summary: { type: 'string', required: true },
    nym: { type: 'string', required: true },
    website: { type: 'string' },
    donationLink: { type: 'string' },
    coverImage: { type: 'string', required: true },
    git: { type: 'string' },
    twitter: { type: 'string' },
    personalTwitter: { type: 'string' },
    nostr: { type: 'string' },
    tags: { type: 'list', of: { type: 'string' } },
    bonusUSD: { type: 'number', default: 0 },
    hidden: { type: 'boolean' },
    showcase: { type: 'boolean' },
  },
  computedFields,
}))

export const Funds = defineDocumentType(() => ({
  name: 'Fund',
  filePathPattern: 'funds/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    dateAdded: { type: 'date', required: true },
    summary: { type: 'string', required: true },
    nym: { type: 'string', required: true },
    website: { type: 'string' },
    coverImage: { type: 'string', required: true },
    git: { type: 'string' },
    twitter: { type: 'string' },
    nostr: { type: 'string' },
    personalTwitter: { type: 'string' },
    zaprite: { type: 'string', required: true },
    btcpay: { type: 'string', required: true },
    store: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    bonusUSD: { type: 'number', default: 0 },
    hidden: { type: 'boolean' },
    showcase: { type: 'boolean' },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors, Pages, Projects, Funds],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      remarkImgToJsx,
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings,
      rehypeKatex,
      [rehypeCitation, { path: path.join(root, 'data') }],
      [rehypePrismPlus, { ignoreMissing: true }],
      rehypePresetMinify,
    ],
  },
})
