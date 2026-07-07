import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Image from '@/components/Image'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { getSpotlightOgImage } from '@/components/post/postShared'

interface Props {
  post: CoreContent<Blog>
  featured?: boolean
}

export default function SpotlightCard({ post, featured = false }: Props) {
  const { path, date, title, summary, images } = post
  const ogImage = getSpotlightOgImage(images)

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
            sizes={
              featured
                ? '100vw'
                : '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'
            }
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className={featured ? 'p-6 sm:p-8' : 'p-5'}>
        <time
          dateTime={date}
          className="text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          {formatDate(date, siteMetadata.locale)}
        </time>
        <h2
          className={`mt-2 font-bold leading-tight tracking-tight text-gray-900 group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400 ${
            featured ? 'text-2xl sm:text-3xl' : 'text-xl'
          }`}
        >
          {title}
        </h2>
        {summary && (
          <p className="mt-3 text-gray-500 dark:text-gray-400">{summary}</p>
        )}
      </div>
    </Link>
  )
}
