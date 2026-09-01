import { useEffect, useState } from 'react'

export type SearchIndex = Record<string, string>

export type SearchablePost = {
  title?: string
  summary?: string
  tags?: string[]
  slug: string
}

let cache: SearchIndex | null = null
let failed = false
let inflight: Promise<SearchIndex | null> | null = null

function fetchSearchIndex(): Promise<SearchIndex | null> {
  if (cache) return Promise.resolve(cache)
  if (failed) return Promise.resolve(null)
  if (inflight) return inflight

  inflight = fetch('/search.json')
    .then((res) => {
      if (!res.ok) throw new Error('search index missing')
      return res.json() as Promise<SearchIndex>
    })
    .then((data) => {
      cache = data
      return data
    })
    .catch(() => {
      failed = true
      return null
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function useSearchIndex() {
  const [index, setIndex] = useState<SearchIndex | null>(cache)
  const [ready, setReady] = useState(cache !== null || failed)

  useEffect(() => {
    if (cache !== null || failed) {
      setIndex(cache)
      setReady(true)
      return
    }

    fetchSearchIndex().then((data) => {
      setIndex(data)
      setReady(true)
    })
  }, [])

  return { index, ready }
}

export function postMatchesSearch(
  post: SearchablePost,
  query: string,
  index: SearchIndex | null
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    post.title || '',
    post.summary || '',
    (post.tags || []).join(' '),
    index?.[post.slug] || '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function searchStatusMessage(
  query: string,
  ready: boolean,
  matchCount: number
): string | null {
  if (!query) return null
  if (!ready) return 'Searching…'
  if (!matchCount) return 'No posts found.'
  return null
}

export type SearchExcerpt = {
  prefix: boolean
  before: string
  match: string
  after: string
  suffix: boolean
}

const EXCERPT_RADIUS = 40

export function getSearchExcerpt(
  post: SearchablePost,
  query: string,
  index: SearchIndex | null
): SearchExcerpt | null {
  const q = query.trim()
  if (!q) return null

  const text = [post.summary || '', index?.[post.slug] || '']
    .filter(Boolean)
    .join(' ')
  const hit = text.toLowerCase().indexOf(q.toLowerCase())
  if (hit < 0) return null

  let start = Math.max(0, hit - EXCERPT_RADIUS)
  let end = Math.min(text.length, hit + q.length + EXCERPT_RADIUS)
  if (start > 0) {
    const space = text.indexOf(' ', start)
    if (space !== -1 && space < hit) start = space + 1
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end)
    if (space > hit + q.length) end = space
  }

  return {
    prefix: start > 0,
    before: text.slice(start, hit),
    match: text.slice(hit, hit + q.length),
    after: text.slice(hit + q.length, end),
    suffix: end < text.length,
  }
}

export function excerptsForPosts(
  posts: SearchablePost[],
  query: string,
  index: SearchIndex | null
): Record<string, SearchExcerpt> {
  const excerpts: Record<string, SearchExcerpt> = {}
  for (const post of posts) {
    const excerpt = getSearchExcerpt(post, query, index)
    if (excerpt) excerpts[post.slug] = excerpt
  }
  return excerpts
}
