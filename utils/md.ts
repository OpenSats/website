import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import sanitize from 'sanitize-filename'
import { FundSlug } from '@prisma/client'

import { fundSlugs } from './funds'
import { ProjectItem } from './types'
import { prisma } from '../server/services'
import { env } from '../env.mjs'

const directories: Record<FundSlug, string> = {
  monero: join(process.cwd(), 'docs/monero/projects'),
  firo: join(process.cwd(), 'docs/firo/projects'),
  privacyguides: join(process.cwd(), 'docs/privacyguides/projects'),
  general: join(process.cwd(), 'docs/general/projects'),
}

const FIELDS = [
  'fund',
  'title',
  'summary',
  'slug',
  'content',
  'coverImage',
  'nym',
  'date',
  'goal',
  'website',
  'socialLinks',
  'staticXMRaddress',
  'isFunded',
  'numdonationsxmr',
  'totaldonationsinfiatxmr',
  'totaldonationsxmr',
  'numdonationsbtc',
  'totaldonationsinfiatbtc',
  'totaldonationsbtc',
  'fiatnumdonations',
  'fiattotaldonationsinfiat',
  'fiattotaldonations',
]

const projectSlugsByFund: Record<FundSlug, string[]> = {
  monero: fs.readdirSync(directories.monero),
  firo: fs.readdirSync(directories.firo),
  privacyguides: fs.readdirSync(directories.privacyguides),
  general: fs.readdirSync(directories.general),
}

export function getSingleFile(path: string) {
  const fullPath = join(process.cwd(), path)
  return fs.readFileSync(fullPath, 'utf8')
}

export function getProjectBySlug(slug: string, fundSlug: FundSlug) {
  const fields = FIELDS
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(directories[fundSlug], `${sanitize(realSlug)}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items: any = {
    numdonationsxmr: 0,
    totaldonationsinfiatxmr: 0,
    totaldonationsxmr: 0,
    numdonationsbtc: 0,
    totaldonationsinfiatbtc: 0,
    totaldonationsbtc: 0,
    fiatnumdonations: 0,
    fiattotaldonationsinfiat: 0,
    fiattotaldonations: 0,
  }

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }

    if (field === 'content') {
      items[field] = content
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
  })

  return items as ProjectItem
}

export async function getProjects(fundSlug?: FundSlug) {
  let projects: ProjectItem[]

  if (fundSlug) {
    const slugs = projectSlugsByFund[fundSlug]
    projects = slugs.map((slug) => getProjectBySlug(slug, fundSlug))
  } else {
    projects = fundSlugs
      .map((_fundSlug) =>
        projectSlugsByFund[_fundSlug].map(
          (slug) => getProjectBySlug(slug, _fundSlug) as ProjectItem
        )
      )
      .flat()
  }

  // Sort projects
  projects = projects
    .sort(() => 0.5 - Math.random())
    .sort((a, b) => {
      // Make active projects always come first
      if (!a.isFunded && b.isFunded) return -1
      if (a.isFunded && !b.isFunded) return 1
      return 0
    })
    .slice(0, 6)

  // Get donation stats for active projects
  await Promise.all(
    projects.map(async (project) => {
      if (project.isFunded) return

      const donations = !env.BUILD_MODE
        ? await prisma.donation.findMany({
            where: { projectSlug: project.slug, fundSlug: project.fund },
          })
        : []

      donations.forEach((donation) => {
        if (donation.cryptoCode === 'XMR') {
          project.numdonationsxmr += 1
          project.totaldonationsxmr += donation.netCryptoAmount || 0
          project.totaldonationsinfiatxmr += donation.netFiatAmount
        }

        if (donation.cryptoCode === 'BTC') {
          project.numdonationsbtc += 1
          project.totaldonationsbtc += donation.netCryptoAmount || 0
          project.totaldonationsinfiatbtc += donation.netFiatAmount
        }

        if (donation.cryptoCode === null) {
          project.fiatnumdonations += 1
          project.fiattotaldonations += donation.netFiatAmount
          project.fiattotaldonationsinfiat += donation.netFiatAmount
        }
      })

      // Make isFunded true if goal has been reached
      const donationsSum =
        ((project.totaldonationsinfiatxmr +
          project.totaldonationsinfiatbtc +
          project.fiattotaldonationsinfiat) /
          project.goal) *
        100

      if (donationsSum >= project.goal) {
        project.isFunded = true
      }
    })
  )

  return projects
}
