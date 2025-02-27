import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { kebabCase } from 'pliny/utils/kebabCase'
import { getAllTags, allCoreContent } from 'pliny/utils/contentlayer'
import { InferGetStaticPropsType } from 'next'
import { allBlogs } from 'contentlayer/generated'

export async function getStaticPaths() {
  const tags = await getAllTags(allBlogs)
  const myPaths = []
  for (const tagX in tags) {
    for (const tagY in tags) {
      if (tagX != tagY) {
        // /tags/opensats/opensats gives 404 error
        myPaths.push({
          params: {
            tag: tagX,
            tag2: tagY,
          },
        })
      }
    }
  }
  return {
    paths: myPaths,
    fallback: false,
  }
}

export const getStaticProps = async (context) => {
  const tag = context.params.tag as string
  const tag2 = context.params.tag2 as string
  const filteredPosts = allCoreContent(
    allBlogs.filter(
      (post) =>
        post.draft !== true &&
        post.tags.map((t) => kebabCase(t)).includes(tag) &&
        post.tags.map((t) => kebabCase(t)).includes(tag2)
    )
  )
  return { props: { posts: filteredPosts, tag } }
}

export default function Tag({
  posts,
  tag,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // Capitalize first letter and convert space to dash
  // adjust title to account for multiple tags
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <TagSEO
        title={`${tag} - ${siteMetadata.title}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  )
}
