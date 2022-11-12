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
  goal: number
}

export type PayReq = {
  amount: number
  project_slug: string
  project_name: string
  email?: string
  name?: string
}

export type Stats = {
  xmr: {
    numdonations: number
    totaldonationsinfiat: number
    totaldonations: number
  }
  btc: {
    numdonations: number
    totaldonationsinfiat: number
    totaldonations: number
  }
  usd: {
    numdonations: number
    totaldonationsinfiat: number
    totaldonations: number
  }
}
