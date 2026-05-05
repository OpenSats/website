import type { Fund, Project } from 'contentlayer/generated'
import { MONTHLY_DONATION_URL } from './constants'

export const FUND_ORDER = ['general', 'nostr', 'ops'] as const

export type FundSlug = (typeof FUND_ORDER)[number]

type FundPageCopy = {
  eyebrow: string
  helper: string
  showcaseHeading: string
  showcaseDescription: string
  emptyState: string
  badgeClassName: string
}

const FUND_DESIGNATION_IDS: Partial<Record<FundSlug, string>> = {
  nostr: 'ENWRA6YZ',
  ops: 'ELL6P2J6',
}

const DEFAULT_BADGE_CLASS_NAME =
  'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200'

const FUND_PAGE_COPY: Record<FundSlug, FundPageCopy> = {
  general: {
    eyebrow: 'Broad bitcoin and FOSS support',
    helper:
      'Use this fund when you want OpenSats to route capital across bitcoin, lightning, privacy, education, and adjacent open-source work.',
    showcaseHeading: 'General Fund projects',
    showcaseDescription:
      'A cross-section of the bitcoin and freedom-tech work currently listed under the General Fund.',
    emptyState: 'No listed projects are attached to this fund yet.',
    badgeClassName:
      'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200',
  },
  nostr: {
    eyebrow: 'Nostr protocol and ecosystem',
    helper:
      'Use this fund when you want to back the nostr protocol, clients, relays, and developer tooling.',
    showcaseHeading: 'Nostr Fund projects',
    showcaseDescription:
      'Projects currently listed under the Nostr Fund, from clients and relays to publishing and identity tooling.',
    emptyState: 'No listed projects are attached to this fund yet.',
    badgeClassName:
      'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
  },
  ops: {
    eyebrow: 'Keeps OpenSats running',
    helper:
      'Use this fund when you want to cover OpenSats operating costs and preserve 100% pass-through donations to supported projects.',
    showcaseHeading: 'Operations Budget',
    showcaseDescription:
      'This bucket covers OpenSats itself, so there are no downstream project cards to browse here.',
    emptyState:
      'The Operations Budget covers OpenSats itself, so this section stays focused on the fund rather than downstream projects.',
    badgeClassName:
      'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200',
  },
}

export function getFundPageCopy(slug: string): FundPageCopy {
  if (slug in FUND_PAGE_COPY) {
    return FUND_PAGE_COPY[slug as FundSlug]
  }

  return {
    eyebrow: 'Open-source funding',
    helper: 'Support open-source builders through OpenSats.',
    showcaseHeading: 'Projects',
    showcaseDescription: 'Browse projects connected to this fund.',
    emptyState: 'No listed projects are attached to this fund yet.',
    badgeClassName: DEFAULT_BADGE_CLASS_NAME,
  }
}

export function getFundDonateUrl(slug: string): string {
  const designationId = FUND_DESIGNATION_IDS[slug as FundSlug]
  return designationId
    ? `${MONTHLY_DONATION_URL}?designationId=${designationId}`
    : MONTHLY_DONATION_URL
}

export function sortFunds(funds: Fund[]): Fund[] {
  return [...funds].sort((a, b) => {
    const aIndex = FUND_ORDER.indexOf(a.slug as FundSlug)
    const bIndex = FUND_ORDER.indexOf(b.slug as FundSlug)

    if (aIndex === -1 && bIndex === -1) {
      return a.title.localeCompare(b.title)
    }

    if (aIndex === -1) return 1
    if (bIndex === -1) return -1

    return aIndex - bIndex
  })
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.title.localeCompare(b.title))
}

export function getProjectsForFund(
  projects: Project[],
  fundSlug: string
): Project[] {
  return sortProjects(projects.filter((project) => project.fund === fundSlug))
}

export function getFeaturedProjectsForFund(
  projects: Project[],
  fundSlug: string,
  limit = 3
): Project[] {
  const matchingProjects = getProjectsForFund(projects, fundSlug)
  const featuredProjects = matchingProjects.filter(
    (project) => project.showcase
  )
  const remainingProjects = matchingProjects.filter(
    (project) => !project.showcase
  )

  return [...featuredProjects, ...remainingProjects].slice(0, limit)
}

export function getHighlightedProjects(
  projects: Project[],
  limit = 6
): Project[] {
  return sortProjects(projects.filter((project) => project.showcase)).slice(
    0,
    limit
  )
}

export function countProjectsForFund(
  projects: Project[],
  fundSlug: string
): number {
  return projects.filter((project) => project.fund === fundSlug).length
}
