import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import SectionContainer from '@/components/SectionContainer'
import { BlogSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import PostCoverHero from '@/components/post/PostCoverHero'
import PostArticleBody from '@/components/post/PostArticleBody'
import { getSpotlightHeroImage } from '@/components/post/postShared'

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function SpotlightLayout({
  content,
  authorDetails,
  next,
  prev,
  children,
}: LayoutProps) {
  const { path, date, title, images } = content

  return (
    <>
      <BlogSEO
        url={`${siteMetadata.siteUrl}/${path}`}
        authorDetails={authorDetails}
        {...content}
      />
      <ScrollTopAndComment />
      <PostCoverHero
        title={title}
        date={date}
        coverImage={getSpotlightHeroImage(images)}
      />
      <SectionContainer>
        <article>
          <div className="min-[1000px]:divide-y min-[1000px]:divide-gray-200 min-[1000px]:dark:divide-gray-700">
            <PostArticleBody
              content={content}
              authorDetails={authorDetails}
              next={next}
              prev={prev}
              spotlight
            >
              {children}
            </PostArticleBody>
          </div>
        </article>
      </SectionContainer>
    </>
  )
}
