import type { Topic, Project } from 'contentlayer/generated'

export type TopicLike = Pick<Topic, 'title' | 'slug' | 'aliases'>

export function normalizeTerm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function findProjectForTopic(
  topic: TopicLike,
  projects: Project[]
): Project | null {
  const keys = new Set(
    [topic.title, topic.slug, ...(topic.aliases || [])]
      .map(normalizeTerm)
      .filter(Boolean)
  )
  return (
    projects.find(
      (p) =>
        keys.has(normalizeTerm(p.slug)) || keys.has(normalizeTerm(p.title))
    ) || null
  )
}

export type TopicLink = {
  href: string
  isProject: boolean
  projectTitle: string | null
}

export function getTopicLink(
  topic: TopicLike,
  projects: Project[]
): TopicLink {
  const project = findProjectForTopic(topic, projects)
  if (project) {
    return {
      href: `/projects/${project.slug}`,
      isProject: true,
      projectTitle: project.title,
    }
  }
  return {
    href: `/topics/${topic.slug}`,
    isProject: false,
    projectTitle: null,
  }
}
