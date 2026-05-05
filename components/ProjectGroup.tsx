import type { Project } from 'contentlayer/generated'
import CustomLink from '@/components/Link'
import ProjectDirectoryCard from '@/components/ProjectDirectoryCard'

type Props = {
  id?: string
  title: string
  description?: string
  projects: Project[]
  emptyMessage?: string
  ctaHref?: string
  ctaLabel?: string
}

export default function ProjectGroup({
  id,
  title,
  description,
  projects,
  emptyMessage,
  ctaHref,
  ctaLabel,
}: Props) {
  return (
    <section id={id} className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {description && (
            <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
        {ctaHref && ctaLabel && (
          <CustomLink
            href={ctaHref}
            className="text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {ctaLabel} &rarr;
          </CustomLink>
        )}
      </div>

      {projects.length > 0 ? (
        <ul className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectDirectoryCard project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-y border-dashed border-gray-300 py-8 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:text-gray-300">
          {emptyMessage || 'Nothing to show here yet.'}
        </p>
      )}
    </section>
  )
}
