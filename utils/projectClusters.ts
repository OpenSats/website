import type { Project } from 'contentlayer/generated'

export type Cluster = {
  id: string
  title: string
  blurb: string
  slugs: string[]
}

export type ResolvedCluster = Omit<Cluster, 'slugs'> & {
  projects: Project[]
}

/**
 * Editorial groupings for the project showcase. Order matters — clusters are
 * rendered in the order they appear here, and projects within a cluster are
 * rendered in the order their slugs are listed.
 */
export const CLUSTERS: Cluster[] = [
  {
    id: 'privacy-infra',
    title: 'Privacy & Infrastructure',
    blurb: 'The plumbing that keeps the rest of the stack honest.',
    slugs: ['tor', 'grapheneos', 'pdk'],
  },
  {
    id: 'core',
    title: 'Protocol Maintenance & Development',
    blurb: 'The full node, validation, and the protocol underneath.',
    slugs: ['bitcoin-core', 'floresta', 'stratumv2', 'splicing', 'vls'],
  },
  {
    id: 'education',
    title: 'Education & Research',
    blurb: 'People bringing in the next wave of contributors.',
    slugs: ['summerofbitcoin', 'satoshinakamotoinstitute', 'bitcoindesign'],
  },
  {
    id: 'dev-tooling-testing',
    title: 'Developer Tooling & Testing',
    blurb:
      'Libraries, kits, and workflow tools engineers use to build and ship.',
    slugs: ['bdk', 'cdk', 'ndk', 'ngit'],
  },
  {
    id: 'wallets',
    title: 'Wallets',
    blurb: 'Self-custody software people actually use.',
    slugs: ['cove', 'blixt', 'blitz-wallet'],
  },
  {
    id: 'lightning-payments',
    title: 'Merchant Tooling & Payments',
    blurb: 'Payments, point-of-sale, and merchant tooling on Lightning.',
    slugs: ['btcpayserver', 'lnbits'],
  },
  {
    id: 'chaumian-ecash',
    title: 'Chaumian ecash',
    blurb: 'Ecash wallets and mint software on Cashu.',
    slugs: ['minibits', 'cashu', 'opencash'],
  },
  {
    id: 'nostr-clients',
    title: 'Nostr Clients',
    blurb: 'How people read and post on nostr today.',
    slugs: ['damus', 'amethyst', '0xchat', 'coracle', 'flotilla', 'soapbox'],
  },
  {
    id: 'nostr-infra',
    title: 'Nostr Infrastructure',
    blurb: 'Relays, libraries, signers, and developer tooling.',
    slugs: ['applesauce', 'citrine', 'frostr', 'amber', 'zapstore'],
  },
]

/**
 * Resolve cluster slug lists against the full project set, dropping unknown
 * slugs and clusters that end up empty. In development, warns about
 * non-OpenSats projects that aren't included in any cluster so the curation
 * stays in sync with the data folder.
 */
export function buildClusters(allProjects: Project[]): ResolvedCluster[] {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]))

  const resolved = CLUSTERS.map(({ slugs, ...rest }) => ({
    ...rest,
    projects: slugs
      .map((slug) => bySlug.get(slug))
      .filter((p): p is Project => Boolean(p)),
  })).filter((c) => c.projects.length > 0)

  if (process.env.NODE_ENV !== 'production') {
    const clustered = new Set(CLUSTERS.flatMap((c) => c.slugs))
    const orphans = allProjects
      .filter((p) => p.nym !== 'OpenSats' && !clustered.has(p.slug))
      .map((p) => p.slug)
    if (orphans.length > 0) {
      console.warn(
        `[projectClusters] ${orphans.length} project(s) not in any cluster:`,
        orphans
      )
    }
  }

  return resolved
}
