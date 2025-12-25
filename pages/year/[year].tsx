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
  const years = [2024, 2025]
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

  // Extract all unique tags from posts
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).sort()

  return {
    props: {
      year,
      posts: allCoreContent(posts),
      allTags,
    },
  }
}

interface TagFilterProps {
  tags: string[]
  selectedTags: Set<string>
  onToggle: (tag: string) => void
}

function TagFilter({ tags, selectedTags, onToggle }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 pb-6">
      {tags.map((tag) => {
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
            {tag}
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
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(allTags))

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

  const filteredPosts = (posts as CoreContent<Blog>[]).filter((post) =>
    post.tags?.some((tag) => selectedTags.has(tag))
  )

  return (
    <>
      <PageSEO
        title={`${year} - ${siteMetadata.author}`}
        description={`All blog posts from ${year}`}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {year}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Filter by tags:
          </p>
          <TagFilter
            tags={allTags}
            selectedTags={selectedTags}
            onToggle={handleTagToggle}
          />
        </div>
        {!filteredPosts.length && 'No posts found.'}
        <PostList posts={filteredPosts} />
      </div>
    </>
  )
}
