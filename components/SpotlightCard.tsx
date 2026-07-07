import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Image from '@/components/Image'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import {
  getSpotlightOgImage,
  getSpotlightHeroImage,
} from '@/components/post/postShared'

interface Props {
  post: CoreContent<Blog>
  featured?: boolean
}

export default function SpotlightCard({ post, featured = false }: Props) {
  const { path, date, title, summary, images } = post
  const ogImage = getSpotlightOgImage(images)

  if (featured) {
    const heroImage = getSpotlightHeroImage(images) ?? ogImage
    return (
      <Link
        href={`/${path}`}
        aria-label={`Read the spotlight: ${title}`}
        className="group relative block overflow-hidden rounded-lg border-2 border-gray-200 border-opacity-60 transition-colors hover:border-primary-500 dark:border-gray-700 dark:hover:border-primary-400"
      >
        <div className="relative min-h-[24rem] w-full sm:aspect-[2/1] sm:min-h-0 lg:aspect-[21/9]">
          {heroImage && (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[70%_center] transition-transform duration-300 group-hover:scale-105 lg:object-center"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
            aria-hidden
          />
          {ogImage && (
            <div className="absolute right-4 top-4 hidden w-40 overflow-hidden rounded-md border-2 border-white/80 shadow-lg sm:block lg:w-56">
              <div className="relative aspect-[16/9]">
                <Image
                  src={ogImage}
                  alt={title}
                  fill
                  sizes="14rem"
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Developer Spotlight
            </p>
            <time
              dateTime={date}
              className="mt-2 block text-sm font-medium text-white/90"
            >
              {formatDate(date, siteMetadata.locale)}
            </time>
            <h2 className="mt-2 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
              {title}
            </h2>
            {summary && (
              <p className="mt-3 line-clamp-2 max-w-2xl text-white/90 sm:line-clamp-3">
                {summary}
              </p>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/${path}`}
      aria-label={`Read the spotlight: ${title}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border-2 border-gray-200 border-opacity-60 transition-colors hover:border-primary-500 dark:border-gray-700 dark:hover:border-primary-400"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {ogImage && (
          <Image
            src={ogImage}
            alt={title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-5">
        <time
          dateTime={date}
          className="text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          {formatDate(date, siteMetadata.locale)}
        </time>
        <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-gray-900 group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
          {title}
        </h2>
        {summary && (
          <p className="mt-3 text-gray-500 dark:text-gray-400">{summary}</p>
        )}
      </div>
    </Link>
  )
}
