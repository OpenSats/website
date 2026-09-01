import { useCallback, useState } from 'react'

export type SearchIndex = Record<string, string>

export type SearchablePost = {
  title?: string
  summary?: string
  tags?: string[]
  slug: string
}

let cache: SearchIndex | null = null
let inflight: Promise<SearchIndex | null> | null = null

function fetchSearchIndex(): Promise<SearchIndex | null> {
  if (cache) return Promise.resolve(cache)
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
    .catch(() => null)
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function useSearchIndex() {
  const [index, setIndex] = useState<SearchIndex | null>(cache)

  const load = useCallback(() => {
    if (cache) {
      setIndex(cache)
      return
    }
    fetchSearchIndex().then(setIndex)
  }, [])

  return { index, load }
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
