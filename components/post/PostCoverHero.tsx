import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'
import PostDefaultHeader from '@/components/post/PostDefaultHeader'
import {
  postDateShortTemplate,
  postSectionClasses,
  postSpotlightGridClasses,
} from '@/components/post/postShared'

interface Props {
  title: string
  date: string
  coverImage?: string
}

// Wide cover assets (~2.3:1) work best; subject on the right leaves room for text on the left.
export default function PostCoverHero({ title, date, coverImage }: Props) {
  if (!coverImage) {
    return <PostDefaultHeader date={date} title={title} />
  }

  const formattedDate = new Date(date).toLocaleDateString(
    siteMetadata.locale,
    postDateShortTemplate
  )

  return (
    <div className="relative w-full">
      <div className="relative min-h-[min(70vh,28rem)] w-full max-lg:max-h-[32rem] xl:aspect-[1916/821] xl:max-h-none xl:min-h-0">
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] xl:object-[center_right]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent xl:from-black/60 xl:via-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent xl:from-black/80 xl:via-black/30"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 pb-6 xl:pb-8">
          <div className={postSectionClasses}>
            <div className={postSpotlightGridClasses}>
              <div className="min-[1000px]:col-span-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/80 sm:text-xs">
                  Developer Spotlight
                </p>
                <dl className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
                  <div>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-xs font-medium text-white/90 sm:text-sm">
                      <time dateTime={date}>{formattedDate}</time>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Title</dt>
                    <dd>
                      <h1 className="text-2xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-3xl sm:leading-tight md:text-4xl xl:text-5xl xl:leading-tight">
                        {title}
                      </h1>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
