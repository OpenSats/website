import type { Project } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import { getFundPageCopy } from '@/utils/projectShowcase'

type Props = {
  project: Project
}

export default function ProjectDirectoryCard({ project }: Props) {
  const fundCopy = project.fund ? getFundPageCopy(project.fund) : null
  const tags = project.tags?.slice(0, 3) || []
  const meta = [
    project.fund === 'nostr'
      ? 'Nostr Fund'
      : project.fund === 'general'
      ? 'General Fund'
      : null,
    project.showcase ? 'Highlighted' : null,
  ].filter(Boolean)

  return (
    <article className="grid gap-4 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
      <div className="min-w-0">
        {meta.length > 0 && fundCopy && (
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${fundCopy.eyebrowClassName}`}
          >
            {meta.join(' · ')}
          </p>
        )}
        <h3 className="mt-2 text-xl font-bold leading-7 text-gray-900 dark:text-gray-100">
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

      <div>
        <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
          {project.summary}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {tags.length > 0 && (
            <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              {tags.join(' · ')}
            </p>
          )}

          <CustomLink
            href={`/projects/${project.slug}`}
            className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-500 dark:text-gray-100 dark:decoration-gray-700 dark:hover:text-primary-400"
          >
            View project
          </CustomLink>
        </div>
      </div>
    </article>
  )
}
