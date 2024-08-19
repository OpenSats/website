import { FundSlug } from '@prisma/client'
import { ProjectItem } from './types'

export const funds: Record<FundSlug, ProjectItem & { slug: FundSlug }> = {
  monero: {
    slug: 'monero',
    nym: 'MagicMonero',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'MAGIC Monero Fund',
    summary: 'Support contributors to Monero',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    goal: 100000,
  },
  firo: {
    slug: 'firo',
    nym: 'MagicFiro',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'MAGIC Firo Fund',
    summary: 'Support contributors to Firo',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    goal: 100000,
  },
  privacyguides: {
    slug: 'privacyguides',
    nym: 'MagicPrivacyGuides',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'MAGIC Privacy Guides Fund',
    summary: 'Support contributors to Privacy Guides',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    goal: 100000,
  },
  general: {
    slug: 'general',
    nym: 'MagicGeneral',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'MAGIC General Fund',
    summary: 'Support contributors to MAGIC',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    goal: 100000,
  },
}

export const fundSlugs = Object.keys(funds) as ['monero', 'firo', 'privacyguides', 'general']

export function getFundSlugFromUrlPath(urlPath: string) {
  const fundSlug = urlPath.replace(/(\?.*)$/, '').split('/')[1]

  return fundSlugs.includes(fundSlug as any) ? (fundSlug as FundSlug) : null
}
