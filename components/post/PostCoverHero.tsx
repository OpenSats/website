import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'
import PostDefaultHeader from '@/components/post/PostDefaultHeader'
import {
  postDateTemplate,
  postGridClasses,
  postSectionClasses,
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

  return (
    <div className="relative left-1/2 right-1/2 -mb-2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] sm:mb-0">
      <div className="relative aspect-[1916/821] min-h-56 w-full sm:min-h-64 lg:min-h-0">
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_right]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 pb-8">
          <div className={postSectionClasses}>
            <div className={postGridClasses}>
              <div className="xl:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                  Developer Spotlight
                </p>
                <dl className="mt-3 space-y-3">
                  <div>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-sm font-medium text-white/90">
                      <time dateTime={date}>
                        {new Date(date).toLocaleDateString(
                          siteMetadata.locale,
                          postDateTemplate
                        )}
                      </time>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Title</dt>
                    <dd>
                      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
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
