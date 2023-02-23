import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import {ProjectItem} from "./types";
const postsDirectory = join(process.cwd(), 'docs/projects')

const FIELDS = ['title',
  'summary',
  'slug',
  'git',
  'content',
  'coverImage',
  'nym',
  'website',
  'zaprite',
  'twitter',
  'personalTwitter',
  'hidden'
]

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory)
}

export function getSingleFile(path: string) {
  const fullPath = join(process.cwd(), path)
  return fs.readFileSync(fullPath, 'utf8')
}

export function getPostBySlug(slug: string, includeHidden: boolean = false): ProjectItem {
  const fields = FIELDS
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items: any = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }
    if (field === 'content') {
      items[field] = content
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
  })
  if (items.hidden && !includeHidden) {
    throw new Error('Hidden project')
  }
  return items
}

export function getAllPosts() : ProjectItem[] {
  const slugs = getPostSlugs()
  //get all posts & return them but make sure to catch errors from getPostBySlug and filter them out
  return slugs.map((slug) => {
    try {
      return getPostBySlug(slug)
    } catch {
      return null
    }
  }).filter(a => a != null) as ProjectItem[]
}
