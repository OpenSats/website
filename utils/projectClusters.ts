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

export const CLUSTERS: Cluster[] = [
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    blurb: 'Operating systems, anonymity networks, and secure networking.',
    slugs: ['tor', 'grapheneos', 'wireguard'],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    blurb: 'Wallet and payment tools built for more private Bitcoin use.',
    slugs: ['pdk', 'dana-wallet'],
  },
  {
    id: 'core',
    title: 'Protocol Maintenance & Development',
    blurb: 'The full node, validation, and the protocol underneath.',
    slugs: [
      'bitcoin-core',
      'libbitcoin',
      'floresta',
      'utreexod',
      'stratumv2',
      'splicing',
      'vls',
      'asmap',
    ],
  },
  {
    id: 'education',
    title: 'Education & Research',
    blurb: 'People bringing in the next wave of contributors.',
    slugs: [
      'summerofbitcoin',
      'satoshinakamotoinstitute',
      'bitcoindesign',
      'bitshala',
    ],
  },
  {
    id: 'dev-tooling-testing',
    title: 'Developer Tooling & Testing',
    blurb:
      'Libraries, kits, and workflow tools engineers use to build and ship.',
    slugs: [
      'bdk',
      'rust-bitcoin',
      'cdk',
      'ndk',
      'ngit',
      'bitcoinfuzz',
      'bitcoinresearchkit',
    ],
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
    slugs: ['btcpayserver', 'lnbits', 'mostro'],
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

export function buildClusters(allProjects: Project[]): ResolvedCluster[] {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]))

  const resolved = CLUSTERS.map(({ slugs, ...rest }) => ({
    ...rest,
    projects: slugs
      .map((slug) => bySlug.get(slug))
      .filter((p): p is Project => Boolean(p))
      .sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      ),
  })).filter((cluster) => cluster.projects.length > 0)

  if (process.env.NODE_ENV !== 'production') {
    const clustered = new Set(CLUSTERS.flatMap((cluster) => cluster.slugs))
    const orphans = allProjects
      .filter(
        (project) => project.nym !== 'OpenSats' && !clustered.has(project.slug)
      )
      .map((project) => project.slug)

    if (orphans.length > 0) {
      console.warn(
        `[projectClusters] ${orphans.length} project(s) not in any cluster:`,
        orphans
      )
    }
  }

  return resolved
}
