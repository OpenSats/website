import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { InferGetStaticPropsType } from 'next'
import { allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'

const YEAR = 2025
const POSTS_PER_PAGE = 100

export const getStaticProps = async () => {
  const allPosts = sortedBlogPost(allBlogs) as Blog[]
  const posts = allPosts
    .filter((post) => new Date(post.date).getFullYear() === YEAR)
    .filter((post) => !post.title.toLowerCase().includes('wave'))
    .reverse() // Oldest first
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return {
    props: {
      initialDisplayPosts: allCoreContent(initialDisplayPosts),
      posts: allCoreContent(posts),
      pagination,
    },
  }
}

export default function Blog2025Page({
  posts,
  initialDisplayPosts,
  pagination,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title={`${YEAR} - ${siteMetadata.author}`}
        description={`All blog posts from ${YEAR}`}
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title={`${YEAR}`}
      />
    </>
  )
}

