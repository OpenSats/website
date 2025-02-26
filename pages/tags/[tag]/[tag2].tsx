import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { kebabCase } from 'pliny/utils/kebabCase'
import { getAllTags, allCoreContent } from 'pliny/utils/contentlayer'
import { InferGetStaticPropsType } from 'next'
import { allBlogs } from 'contentlayer/generated'
import { usePathname } from 'next/navigation'

export async function getStaticPaths() {
  const tags = await getAllTags(allBlogs)
  //generate all paths
  // create params that include:
  // { params: {tag: 'tag1'} }                ./tags/tag1
  // { params: {tag: 'tag1', 'tag2'} }        ./tags/tag1/tag2
  /*const oneTagPaths = Object.keys(tags).map((tag) => ({
    params: {
      tag2: tag 
    },
  }))
//oneTagPaths.push( {params: {tag: 'new'}})*/
  return {
    paths: [
      {
        params: {
          tag: 'opensats',
          tag2: 'funding',
        },
      },
    ],
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
  const x = usePathname()
  console.log(x)
  const y = x.split('/')
  return (
    <>
      <TagSEO
        title={`${tag} - ${siteMetadata.title}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      Tags: {`${y.at(-1)}`}
      <ListLayout posts={posts} title={title} />
    </>
  )
}
