import { FundSlug } from '@prisma/client'
import { ProjectItem } from './types'
import { env } from '../env.mjs'

export const funds: Record<FundSlug, ProjectItem & { slug: FundSlug }> = {
  monero: {
    slug: 'monero',
    nym: 'MagicMonero',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'Monero Fund',
    summary:
      'Help us to provide sustainable funding for free and open-source contributors working on freedom tech and projects that help Monero flourish.',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    // The attributes below can be ignored
    goal: 100000,
    fund: 'monero',
    fiatnumdonations: 0,
    fiattotaldonations: 0,
    fiattotaldonationsinfiat: 0,
    numdonationsbtc: 0,
    numdonationsxmr: 0,
    totaldonationsbtc: 0,
    totaldonationsinfiatbtc: 0,
    totaldonationsinfiatxmr: 0,
    totaldonationsxmr: 0,
  },
  firo: {
    slug: 'firo',
    nym: 'MagicFiro',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'Firo Fund',
    summary: 'Support contributors to Firo',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    // The attributes below can be ignored
    goal: 100000,
    fund: 'firo',
    fiatnumdonations: 0,
    fiattotaldonations: 0,
    fiattotaldonationsinfiat: 0,
    numdonationsbtc: 0,
    numdonationsxmr: 0,
    totaldonationsbtc: 0,
    totaldonationsinfiatbtc: 0,
    totaldonationsinfiatxmr: 0,
    totaldonationsxmr: 0,
  },
  privacyguides: {
    slug: 'privacyguides',
    nym: 'MagicPrivacyGuides',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'Privacy Guides Fund',
    summary: 'Support contributors to Privacy Guides',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    // The attributes below can be ignored
    goal: 100000,
    fund: 'privacyguides',
    fiatnumdonations: 0,
    fiattotaldonations: 0,
    fiattotaldonationsinfiat: 0,
    numdonationsbtc: 0,
    numdonationsxmr: 0,
    totaldonationsbtc: 0,
    totaldonationsinfiatbtc: 0,
    totaldonationsinfiatxmr: 0,
    totaldonationsxmr: 0,
  },
  general: {
    slug: 'general',
    nym: 'MagicGeneral',
    website: 'https://monerofund.org',
    personalWebsite: 'https://monerofund.org',
    title: 'General Fund',
    summary: 'Support contributors to MAGIC',
    coverImage: '/img/crystalball.jpg',
    git: 'magicgrants',
    twitter: 'magicgrants',
    // The attributes below can be ignored
    goal: 100000,
    fund: 'general',
    fiatnumdonations: 0,
    fiattotaldonations: 0,
    fiattotaldonationsinfiat: 0,
    numdonationsbtc: 0,
    numdonationsxmr: 0,
    totaldonationsbtc: 0,
    totaldonationsinfiatbtc: 0,
    totaldonationsinfiatxmr: 0,
    totaldonationsxmr: 0,
  },
}

export const fundSlugToRecipientEmail: Record<FundSlug, string> = {
  monero: env.NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT,
  firo: env.NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT,
  privacyguides: env.NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT,
  general: env.NEXT_PUBLIC_MONERO_APPLICATION_RECIPIENT,
}

export const fundSlugs = Object.keys(funds) as ['monero', 'firo', 'privacyguides', 'general']

export function getFundSlugFromUrlPath(urlPath: string) {
  const fundSlug = urlPath.replace(/(\?.*)$/, '').split('/')[1]

  return fundSlugs.includes(fundSlug as any) ? (fundSlug as FundSlug) : null
}
