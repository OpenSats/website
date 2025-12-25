import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { PageSEO } from '@/components/SEO'
import { sortedBlogPost, allCoreContent, CoreContent } from 'pliny/utils/contentlayer'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'
import PostList from '@/components/PostList'

const POSTS_PER_PAGE = 100

export const getStaticPaths: GetStaticPaths = async () => {
  const years = [2023, 2024, 2025]
  return {
    paths: years.map((year) => ({ params: { year: String(year) } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const year = Number(params?.year)
  const allPosts = sortedBlogPost(allBlogs) as Blog[]
  const posts = allPosts
    .filter((post) => new Date(post.date).getFullYear() === year)
    .reverse() // Oldest first

  // Extract all tags and count occurrences
  const tagCounts = posts
    .flatMap((post) => post.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Sort tags by frequency (most common first), separate common tags
  const commonTagNames = ['opensats', 'grants', 'bitcoin']
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  const allTags = sortedTags.filter((tag) => !commonTagNames.includes(tag.toLowerCase()))
  const commonTags = sortedTags.filter((tag) => commonTagNames.includes(tag.toLowerCase()))

  return {
    props: {
      year,
      posts: allCoreContent(posts),
      allTags,
      commonTags,
      tagCounts,
    },
  }
}

interface TagFilterProps {
  tags: string[]
  commonTags: string[]
  tagCounts: Record<string, number>
  selectedTags: Set<string>
  onToggle: (tag: string) => void
  onSelectAll: () => void
  onSelectNone: () => void
}

function TagFilter({ tags, commonTags, tagCounts, selectedTags, onToggle, onSelectAll, onSelectNone }: TagFilterProps) {
  const [showCommon, setShowCommon] = useState(false)

  const displayTags = showCommon ? [...commonTags, ...tags] : tags

  return (
    <div className="flex flex-wrap gap-2 pb-6">
      <button
        onClick={onSelectAll}
        className="rounded-full px-3 py-1 text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        All
      </button>
      <button
        onClick={onSelectNone}
        className="rounded-full px-3 py-1 text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        None
      </button>
      {commonTags.length > 0 && (
        <button
          onClick={() => setShowCommon(!showCommon)}
          className="px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title={showCommon ? 'Hide common tags' : 'Show common tags'}
        >
          {showCommon ? '>' : '<'}
        </button>
      )}
      {displayTags.map((tag) => {
        const isSelected = selectedTags.has(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tagCounts[tag]}x {tag}
          </button>
        )
      })}
    </div>
  )
}

export default function YearPage({
  year,
  posts,
  allTags,
  commonTags,
  tagCounts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const allTagsCombined = [...allTags, ...commonTags]
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(allTagsCombined))
  const [searchValue, setSearchValue] = useState('')

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }

  const handleSelectAll = () => setSelectedTags(new Set(allTagsCombined))
  const handleSelectNone = () => setSelectedTags(new Set())

  const filteredPosts = (posts as CoreContent<Blog>[]).filter((post) => {
    const matchesTags = post.tags?.some((tag) => selectedTags.has(tag))
    const searchContent = post.title + post.summary + post.tags?.join(' ')
    const matchesSearch = searchContent.toLowerCase().includes(searchValue.toLowerCase())
    return matchesTags && matchesSearch
  })

  return (
    <>
      <PageSEO
        title={`${year} - ${siteMetadata.author}`}
        description={`All blog posts from ${year}`}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
              {year}
            </h1>
            <div className="relative max-w-lg">
              <label>
                <span className="sr-only">Search articles</span>
                <input
                  aria-label="Search posts"
                  type="text"
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder=""
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>
              <svg
                className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <TagFilter
            tags={allTags}
            commonTags={commonTags}
            tagCounts={tagCounts}
            selectedTags={selectedTags}
            onToggle={handleTagToggle}
            onSelectAll={handleSelectAll}
            onSelectNone={handleSelectNone}
          />
        </div>
        {!filteredPosts.length && 'No posts found.'}
        <PostList posts={filteredPosts} />
      </div>
    </>
  )
}
