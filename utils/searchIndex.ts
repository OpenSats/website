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
