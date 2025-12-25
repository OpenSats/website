import fs from 'fs'
import path from 'path'
import { useState, useEffect } from 'react'
import { InferGetStaticPropsType } from 'next'
import { PageSEO } from '@/components/SEO'
import Link from '@/components/Link'
import PublicGoogleSheetsParser from 'public-google-sheets-parser'
import { formatNumber } from '@/components/LifetimeStats'

const OPENSATS_ORANGE = '#f97316' // tailwind orange-500

// ISO 3166-1 alpha-2 codes that match the SVG's path ids (id="US", id="DE", ...)
const GRANTEE_COUNTRY_CODES: string[] = [
  'US', // USA
  'CA', // Canada
  'DE', // Germany
  'GB', // United Kingdom
  'IT', // Italy
  'JP', // Japan
  'NL', // Netherlands
  'CH', // Switzerland
  'CN', // China
  'BR', // Brazil
  'AR', // Argentina
  'IE', // Ireland
  'HK', // Hong Kong
  'GE', // Georgia
  'SE', // Sweden
  'ES', // Spain
  'PT', // Portugal
  'NO', // Norway
  'GR', // Greece
  'AU', // Australia
  'IN', // India
  'SI', // Slovenia
  'KR', // Republic of Korea
  'FI', // Finland
  'CZ', // Czech Republic
  'UG', // Uganda
  'BE', // Belgium
  'FR', // France
  'VN', // Vietnam
  'UA', // Ukraine
  'TR', // Turkey
  'SV', // El Salvador
  'NZ', // New Zealand
  'HU', // Hungary
  'SK', // Slovakia
  'NG', // Nigeria
  'PA', // Panama
  'RO', // Romania
  'GT', // Guatemala
  'ID', // Indonesia
  'AE', // UAE
]

export const getStaticProps = async () => {
  const svgPath = path.join(process.cwd(), 'public', 'maps', 'world.svg')
  let svg = fs.readFileSync(svgPath, 'utf8')

  // Strip XML declaration - it doesn't belong in HTML
  svg = svg.replace(/<\?xml[\s\S]*?\?>\s*/i, '').trim()

  // Convert title attributes to <title> child elements for native browser tooltips
  svg = svg.replace(
    /<path([^>]*)\s+title="([^"]*)"([^>]*)\s*\/>/g,
    '<path$1$3><title>$2</title></path>'
  )

  return { props: { svg } }
}

export default function MapPage({
  svg,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [stats, setStats] = useState<{ label: string; value: number }[]>([])

  useEffect(() => {
    const parser = new PublicGoogleSheetsParser(
      '1mLEbHcrJibLN2PKxYq1LHJssq0CGuJRRoaZwot-ncZQ'
    )
    parser.parse().then((data) => {
      setStats(data)
    })
  }, [])

  // Generate CSS selector for highlighted countries (DRY: one selector string)
  const highlightSelector = GRANTEE_COUNTRY_CODES.length
    ? GRANTEE_COUNTRY_CODES.map((c) => `.grant-map svg #${c}`).join(', ')
    : ''

  const highlightCss = highlightSelector
    ? `
      ${highlightSelector} {
        fill: ${OPENSATS_ORANGE} !important;
      }
    `
    : ''

  // stats[0] = grants given, stats[1] = USD allocated, stats[2] = sats sent
  const grantsGiven = stats[0]?.value ? formatNumber(stats[0].value) : '...'
  const usdAllocated = stats[1]?.value ? Math.round(stats[1].value).toLocaleString() : '...'
  const satsSent = stats[2]?.value ? formatNumber(stats[2].value).replace('B', 'billion') : '...'

  return (
    <>
      <PageSEO
        title="Map - OpenSats"
        description="Countries where OpenSats has awarded grants."
      />

      <div>
        <div className="pb-6 pt-6">
          <p className="text-2xl leading-9 text-gray-500 dark:text-gray-400 sm:text-3xl md:text-4xl md:leading-relaxed">
            OpenSats has allocated <Link href="/transparency" className="rounded px-1 -mx-1 bg-primary-100/50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40">${usdAllocated} USD</Link> to free and open-source projects and sent <Link href="/transparency" className="whitespace-nowrap rounded px-1 -mx-1 bg-primary-100/50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40">~{satsSent} sats</Link> to <Link href="/transparency" className="rounded px-1 -mx-1 bg-primary-100/50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40">{grantsGiven} grantees</Link> in <strong className="whitespace-nowrap rounded px-2 -mx-1 bg-primary-500 text-white">40+ countries.</strong>
          </p>
        </div>

        <div className="pt-6 overflow-x-auto">
          <div
            className="grant-map"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>

      <style jsx global>{`
        .grant-map {
          max-width: 100%;
          overflow: hidden;
        }

        .grant-map svg {
          width: 100%;
          height: auto;
          display: block;
          max-width: 100%;
        }

        .grant-map svg path {
          fill: rgb(229 231 235); /* gray-200 */
          stroke: rgb(255 255 255);
          stroke-width: 0.5;
          transition: fill 120ms ease;
        }

        .dark .grant-map svg path {
          fill: rgb(64 64 64); /* neutral-ish */
          stroke: rgb(23 23 23);
        }

        .grant-map svg path:hover {
          fill: rgb(253 186 116); /* orange-300 */
        }

        ${highlightCss}
      `}</style>
    </>
  )
}

