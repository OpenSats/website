import { defineCollection, defineConfig } from '@content-collections/core'
import {
  compileMDX,
  type Options as MdxOptions,
} from '@content-collections/mdx'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'
import { z } from 'zod'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {
  extractTocHeadings,
  remarkCodeTitles,
  remarkImgToJsx,
} from 'pliny/mdx-plugins/index.js'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'

const root = process.cwd()

const mdxOptions: MdxOptions = {
  remarkPlugins: [remarkGfm, remarkCodeTitles, remarkMath, remarkImgToJsx],
  rehypePlugins: [
    rehypeSlug,
    rehypeAutolinkHeadings,
    rehypeKatex,
    [rehypeCitation, { path: path.join(root, 'data') }],
    [rehypePrismPlus, { ignoreMissing: true }],
    rehypePresetMinify,
  ],
}

type ContentDocument = {
  content: string
  _meta: {
    path: string
    filePath: string
    fileName: string
    directory: string
    extension: string
  }
}

type TransformContext = Parameters<typeof compileMDX>[0]

const normalizeDate = (date: string | undefined) =>
  date ? new Date(date).toISOString() : undefined

const omitUndefined = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T

const authorParser = {
  hasContent: true,
  parse: (fileContent: string) => {
    const { data, content } = matter(fileContent)
    return {
      ...data,
      authorContent: data.content,
      content: content.trim(),
    }
  },
}

const transformDocument = async <TDocument extends ContentDocument>(
  document: TDocument,
  context: TransformContext,
  directory: string,
  type: string
) => {
  const { content, ...metadata } = document
  const code = await compileMDX(context, document, mdxOptions)
  const readingStats = readingTime(content)
  const toc = await extractTocHeadings(content)
  const pathName = `${directory}/${document._meta.path}`
  const filePath = `${directory}/${document._meta.filePath}`
  const sourceFileDir = path.posix.dirname(filePath)

  return {
    ...metadata,
    _id: filePath,
    _raw: {
      sourceFilePath: filePath,
      sourceFileName: document._meta.fileName,
      sourceFileDir,
      contentType: 'mdx',
      flattenedPath: pathName,
    },
    type,
    body: { raw: content, code },
    readingTime: {
      text: readingStats.text,
      time: readingStats.time,
      words: readingStats.words,
      minutes: readingStats.minutes,
    },
    slug: document._meta.path,
    path: pathName,
    filePath,
    toc: toc.map(({ value, depth, url }) => ({ value, depth, url })),
  }
}

const blogs = defineCollection({
  name: 'blogs',
  typeName: 'Blog',
  directory: 'data/blog',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional(),
    lastmod: z.string().optional(),
    draft: z.boolean().optional(),
    summary: z.string().optional(),
    images: z.array(z.string()).optional(),
    heroOverlay: z.enum(['default', 'light']).optional(),
    authors: z.array(z.string()).optional(),
    layout: z.string().optional(),
    bibliography: z.string().optional(),
    canonicalUrl: z.string().optional(),
    pullQuotes: z.array(z.string()).optional(),
    fundCard: z.enum(['red', 'nostr', 'ops']).optional(),
    content: z.string(),
  }),
  transform: async (document, context) =>
    omitUndefined({
      ...(await transformDocument(document, context, 'blog', 'Blog')),
      date: normalizeDate(document.date),
      lastmod: normalizeDate(document.lastmod),
    }),
})

const authors = defineCollection({
  name: 'authors',
  typeName: 'Authors',
  directory: 'data/authors',
  include: '**/*.mdx',
  parser: authorParser,
  schema: z.object({
    name: z.string(),
    nym: z.string().optional(),
    avatar: z.string().optional(),
    occupation: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    twitter: z.string().optional(),
    nostr: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    layout: z.string().optional(),
    board: z.boolean().optional(),
    ops: z.boolean().optional(),
    authorContent: z.boolean().optional(),
    content: z.string(),
    design: z.boolean().optional(),
    volunteer: z.boolean().optional(),
  }),
  transform: async (document, context) => {
    const { authorContent, ...contentDocument } = document
    return omitUndefined({
      ...(await transformDocument(
        contentDocument,
        context,
        'authors',
        'Authors'
      )),
      ...(authorContent === undefined ? {} : { content: authorContent }),
    })
  },
})

const pages = defineCollection({
  name: 'pages',
  typeName: 'Pages',
  directory: 'data/pages',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    image: z.string().optional(),
    layout: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) =>
    omitUndefined(await transformDocument(document, context, 'pages', 'Pages')),
})

const projects = defineCollection({
  name: 'projects',
  typeName: 'Project',
  directory: 'data/projects',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    dateAdded: z.string(),
    summary: z.string(),
    nym: z.string(),
    website: z.string().optional(),
    donationLink: z.string().optional(),
    coverImage: z.string(),
    darkCoverImage: z.string().optional(),
    invertDarkImage: z.boolean().optional(),
    containCoverImage: z.boolean().optional(),
    git: z.string().optional(),
    twitter: z.string().optional(),
    personalTwitter: z.string().optional(),
    nostr: z.string().optional(),
    zapstore: z.string().optional(),
    heartbeat: z.string().optional(),
    tags: z.array(z.string()).optional(),
    bonusUSD: z.number().default(0),
    totalSatsSent: z.number().optional(),
    hidden: z.boolean().optional(),
    showcase: z.boolean().optional(),
    fund: z.string().optional(),
    announcementLink: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) =>
    omitUndefined({
      ...(await transformDocument(document, context, 'projects', 'Project')),
      dateAdded: normalizeDate(document.dateAdded),
    }),
})

const newsletters = defineCollection({
  name: 'newsletters',
  typeName: 'Newsletter',
  directory: 'data/newsletter',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    issueNumber: z.number(),
    date: z.string(),
    quarter: z.string(),
    headline: z.string().optional(),
    summary: z.string(),
    image: z.string().optional(),
    layout: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) =>
    omitUndefined({
      ...(await transformDocument(
        document,
        context,
        'newsletter',
        'Newsletter'
      )),
      date: normalizeDate(document.date),
    }),
})

const topics = defineCollection({
  name: 'topics',
  typeName: 'Topic',
  directory: 'data/topics',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    ogSummary: z.string().optional(),
    category: z.string(),
    aliases: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    content: z.string(),
  }),
  transform: async (document, context) =>
    omitUndefined(
      await transformDocument(document, context, 'topics', 'Topic')
    ),
})

const funds = defineCollection({
  name: 'funds',
  typeName: 'Fund',
  directory: 'data/funds',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    ogTitle: z.string().optional(),
    dateAdded: z.string(),
    summary: z.string(),
    nym: z.string(),
    website: z.string().optional(),
    coverImage: z.string(),
    git: z.string().optional(),
    twitter: z.string().optional(),
    nostr: z.string().optional(),
    personalTwitter: z.string().optional(),
    heartbeat: z.string().optional(),
    zaprite: z.string(),
    btcpay: z.string(),
    store: z.string(),
    tags: z.array(z.string()).optional(),
    bonusUSD: z.number().default(0),
    hidden: z.boolean().optional(),
    showcase: z.boolean().optional(),
    announcementLink: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) =>
    omitUndefined({
      ...(await transformDocument(document, context, 'funds', 'Fund')),
      dateAdded: normalizeDate(document.dateAdded),
    }),
})

export default defineConfig({
  content: [blogs, authors, pages, projects, newsletters, topics, funds],
})
