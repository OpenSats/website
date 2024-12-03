import { FundSlug } from '@prisma/client'
import { ProjectItem } from './types'
import { env } from '../env.mjs'

export const funds: Record<FundSlug, ProjectItem & { slug: FundSlug }> = {
  monero: {
    fund: 'monero',
    slug: 'monero',
    nym: 'MagicMonero',
    website: 'https://monerofund.org',
    socialLinks: ['https://monerofund.org', 'https://github.com/magicgrants/Monero-Fund'],
    title: 'Monero Fund',
    summary:
      'Help us to provide sustainable funding for free and open-source contributors working on freedom tech and projects that help Monero flourish.',
    coverImage: '/img/crystalball.jpg',
    // The attributes below can be ignored
    date: '',
    goal: 100000,
    numDonationsBTC: 0,
    numDonationsXMR: 0,
    numDonationsFiat: 0,
    totalDonationsBTC: 0,
    totalDonationsXMR: 0,
    totalDonationsFiat: 0,
    totalDonationsBTCInFiat: 0,
    totalDonationsXMRInFiat: 0,
  },
  firo: {
    fund: 'firo',
    slug: 'firo',
    nym: 'MagicFiro',
    website: 'https://magicgrants.org/funds/firo/',
    socialLinks: ['https://magicgrants.org/funds/firo/'],
    title: 'Firo Fund',
    summary:
      'Help us support security audits, essential infrastructure, and research for the Firo ecosystem.',
    coverImage: '/img/crystalball.jpg',
    // The attributes below can be ignored
    date: '',
    goal: 100000,
    numDonationsBTC: 0,
    numDonationsXMR: 0,
    numDonationsFiat: 0,
    totalDonationsBTC: 0,
    totalDonationsXMR: 0,
    totalDonationsFiat: 0,
    totalDonationsBTCInFiat: 0,
    totalDonationsXMRInFiat: 0,
  },
  privacyguides: {
    fund: 'privacyguides',
    slug: 'privacyguides',
    nym: 'MagicPrivacyGuides',
    website: 'https://privacyguides.org',
    socialLinks: [
      'https://privacyguides.org',
      'https://x.com/privacy_guides',
      'https://mastodon.neat.computer/@privacyguides',
      'https://github.com/privacyguides/',
    ],
    title: 'Privacy Guides Fund',
    summary:
      'Privacy Guides is a not-for-profit, volunteer-run project that hosts online communities and publishes news and recommendations surrounding privacy and security tools, services, and knowledge.',
    coverImage: '/img/crystalball.jpg',
    // The attributes below can be ignored
    date: '',
    goal: 100000,
    numDonationsBTC: 0,
    numDonationsXMR: 0,
    numDonationsFiat: 0,
    totalDonationsBTC: 0,
    totalDonationsXMR: 0,
    totalDonationsFiat: 0,
    totalDonationsBTCInFiat: 0,
    totalDonationsXMRInFiat: 0,
  },
  general: {
    fund: 'general',
    slug: 'general',
    nym: 'MagicGeneral',
    website: 'https://magicgrants.org',
    socialLinks: [
      'https://magicgrants.org',
      'https://x.com/magicgrants',
      'https://github.com/magicgrants',
    ],
    title: 'General Fund',
    summary:
      'MAGIC Grants is a public charity that provides undergraduate scholarships for students interested in cryptocurrencies and privacy, supports public cryptocurrency infrastructure, and supports privacy.',
    coverImage: '/img/crystalball.jpg',
    // The attributes below can be ignored
    date: '',
    goal: 100000,
    numDonationsBTC: 0,
    numDonationsXMR: 0,
    numDonationsFiat: 0,
    totalDonationsBTC: 0,
    totalDonationsXMR: 0,
    totalDonationsFiat: 0,
    totalDonationsBTCInFiat: 0,
    totalDonationsXMRInFiat: 0,
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
