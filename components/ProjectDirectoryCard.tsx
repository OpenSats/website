import type { Project } from 'contentlayer/generated'
import Image from '@/components/Image'
import CustomLink from '@/components/Link'
import { getFundPageCopy } from '@/utils/projectShowcase'

type Props = {
  project: Project
}

export default function ProjectDirectoryCard({ project }: Props) {
  const fundCopy = project.fund ? getFundPageCopy(project.fund) : null
  const tags = project.tags?.slice(0, 3) || []

  return (
    <article className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-primary-500 dark:border-gray-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            {fundCopy && (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${fundCopy.badgeClassName}`}
              >
                {project.fund === 'nostr' ? 'Nostr Fund' : 'General Fund'}
              </span>
            )}
            {project.showcase && (
              <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                Highlighted
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold leading-7 text-gray-900 dark:text-gray-100">
            <CustomLink
              href={`/projects/${project.slug}`}
              className="hover:text-primary-500"
            >
              {project.title}
            </CustomLink>
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            by {project.nym}
          </p>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-stone-50 p-3 dark:bg-stone-950">
          <Image
            alt={project.title}
            src={project.coverImage}
            darkSrc={project.darkCoverImage}
            width={160}
            height={160}
            className={`h-full w-full object-contain ${
              project.invertDarkImage ? 'dark:invert' : ''
            }`}
          />
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {project.summary}
      </p>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5">
        <CustomLink
          href={`/projects/${project.slug}`}
          className="text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
        >
          View project &rarr;
        </CustomLink>
      </div>
    </article>
  )
}
