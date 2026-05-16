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
    id: 'core',
    title: 'Protocol Maintenance & Development',
    blurb: 'Full nodes, validation, and core protocol work.',
    slugs: ['bitcoin-core', 'libbitcoin', 'floresta', 'utreexod', 'asmap'],
  },
  {
    id: 'education',
    title: 'Education & Research',
    blurb: 'Projects that bring in the next wave of contributors.',
    slugs: [
      'summerofbitcoin',
      'satoshinakamotoinstitute',
      'bitcoindesign',
      'bitshala',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    blurb:
      'Wallet and payment tools built to make privacy best practices easier and more user-friendly.',
    slugs: ['pdk', 'dana-wallet', 'mostro'],
  },
  {
    id: 'mining',
    title: 'Mining',
    blurb: 'Mining protocols and infrastructure.',
    slugs: ['stratumv2'],
  },
  {
    id: 'lightning',
    title: 'Lightning',
    blurb: 'Lightning protocols, security, and infrastructure.',
    slugs: ['splicing', 'stable-channels', 'vls'],
  },
  {
    id: 'dev-tooling-testing',
    title: 'Developer Tooling & Testing',
    blurb:
      'Libraries, kits, and workflow tools engineers use to build and ship.',
    slugs: ['bdk', 'rust-bitcoin', 'bitcoinfuzz', 'bitcoinresearchkit'],
  },
  {
    id: 'wallets',
    title: 'Wallets',
    blurb: 'Self-custody software built for everyday use.',
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
    slugs: ['minibits', 'cashu', 'cdk', 'opencash'],
  },
  {
    id: 'nostr-clients',
    title: 'Nostr Clients',
    blurb: 'How people read and post on nostr today.',
    slugs: ['damus', 'amethyst', '0xchat', 'coracle', 'flotilla', 'soapbox'],
  },
  {
    id: 'nostr-dev-tooling',
    title: 'Nostr Developer Tooling',
    blurb: 'SDKs and tools for building on nostr.',
    slugs: ['applesauce', 'ndk', 'ngit'],
  },
  {
    id: 'nostr-infra',
    title: 'Nostr Infrastructure',
    blurb: 'Relays, signers, and core infrastructure for nostr.',
    slugs: ['citrine', 'frostr', 'amber', 'zapstore'],
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
