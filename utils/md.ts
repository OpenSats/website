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

const projectSlugsByFund: Record<FundSlug, string[]> = {
  monero: fs.readdirSync(directories.monero).filter((filename) => filename !== '.gitkeep'),
  firo: fs.readdirSync(directories.firo).filter((filename) => filename !== '.gitkeep'),
  privacyguides: fs
    .readdirSync(directories.privacyguides)
    .filter((filename) => filename !== '.gitkeep'),
  general: fs.readdirSync(directories.general).filter((filename) => filename !== '.gitkeep'),
}

export function getSingleFile(path: string) {
  const fullPath = join(process.cwd(), sanitize(path))
  return fs.readFileSync(fullPath, 'utf8')
}

export function fileExists(path: string) {
  const fullPath = join(process.cwd(), sanitize(path))
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export function getProjectBySlug(slug: string, fundSlug: FundSlug) {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(directories[fundSlug], `${sanitize(realSlug)}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const project: ProjectItem = {
    fund: data.fund,
    slug: realSlug,
    title: data.title,
    summary: data.summary,
    content: content,
    coverImage: data.coverImage,
    nym: data.nym,
    date: data.date,
    website: data.website,
    socialLinks: data.socialLinks,
    goal: data.goal,
    isFunded: !!data.isFunded,
    staticXMRaddress: data.staticXMRaddress || null,
    numDonationsBTC: data.numDonationsBTC || 0,
    numDonationsXMR: data.numDonationsXMR || 0,
    numDonationsFiat: data.numDonationsFiat || 0,
    totalDonationsBTC: data.totalDonationsBTC || 0,
    totalDonationsXMR: data.totalDonationsXMR || 0,
    totalDonationsFiat: data.totalDonationsFiat || 0,
    totalDonationsBTCInFiat: data.totalDonationsBTCInFiat || 0,
    totalDonationsXMRInFiat: data.totalDonationsXMRInFiat || 0,
  }

  return project
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
          project.numDonationsXMR += 1
          project.totalDonationsXMR += donation.netCryptoAmount || 0
          project.totalDonationsXMRInFiat += donation.netFiatAmount
        }

        if (donation.cryptoCode === 'BTC') {
          project.numDonationsBTC += 1
          project.totalDonationsBTC += donation.netCryptoAmount || 0
          project.totalDonationsBTCInFiat += donation.netFiatAmount
        }

        if (donation.cryptoCode === null) {
          project.numDonationsFiat += 1
          project.totalDonationsFiat += donation.netFiatAmount
        }
      })

      // Make isFunded true if goal has been reached
      const donationsSum =
        ((project.totalDonationsXMRInFiat +
          project.totalDonationsBTCInFiat +
          project.totalDonationsFiat) /
          project.goal) *
        100

      if (donationsSum >= project.goal) {
        project.isFunded = true
      }
    })
  )

  return projects
}
