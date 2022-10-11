export type ProjectItem = {
  slug: string
  nym: string
  content?: string
  title: string
  summary: string
  coverImage: string
  git: string
  twitter?: string
  website: string
  personalTwitter?: string
}

export type PayReq = {
  amount: number
  project_slug: string
  project_name: string
  email?: string
  name?: string
}

export type Stats = {
  total: number
  donations: number
}
