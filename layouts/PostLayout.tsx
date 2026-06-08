import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import SectionContainer from '@/components/SectionContainer'
import { BlogSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import PostDefaultHeader from '@/components/post/PostDefaultHeader'
import PostArticleBody from '@/components/post/PostArticleBody'

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({
  content,
  authorDetails,
  next,
  prev,
  children,
}: LayoutProps) {
  const { path, date, title } = content

  return (
    <SectionContainer>
      <BlogSEO
        url={`${siteMetadata.siteUrl}/${path}`}
        authorDetails={authorDetails}
        {...content}
      />
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <PostDefaultHeader date={date} title={title} />
          <PostArticleBody
            content={content}
            authorDetails={authorDetails}
            next={next}
            prev={prev}
          >
            {children}
          </PostArticleBody>
        </div>
      </article>
    </SectionContainer>
  )
}
