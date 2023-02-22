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

export function getPostBySlug(slug: string, includeHidden: boolean = false): ProjectItem | null {
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
    return null;
  }
  return items
}

export function getAllPosts() : ProjectItem[] {
  const slugs = getPostSlugs()
  return slugs.map((slug) => getPostBySlug(slug)).filter(a => a != null) as ProjectItem[]
}
