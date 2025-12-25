import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'

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
    .filter((post) => !post.title.toLowerCase().includes('wave'))
    .filter((post) => !post.title.toLowerCase().includes('long-term'))
    .filter((post) => !post.title.toLowerCase().includes('advancements'))
    .reverse() // Oldest first
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return {
    props: {
      year,
      initialDisplayPosts: allCoreContent(initialDisplayPosts),
      posts: allCoreContent(posts),
      pagination,
    },
  }
}

export default function YearPage({
  year,
  posts,
  initialDisplayPosts,
  pagination,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title={`${year} - ${siteMetadata.author}`}
        description={`All blog posts from ${year}`}
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title={`${year}`}
      />
    </>
  )
}

