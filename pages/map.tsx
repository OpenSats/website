import fs from 'fs'
import path from 'path'
import { InferGetStaticPropsType } from 'next'
import { PageSEO } from '@/components/SEO'
import StatsSentence from '@/components/StatsSentence'

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

  // Extract width/height and add viewBox for proper responsive scaling
  const widthMatch = svg.match(/width="([^"]+)"/)
  const heightMatch = svg.match(/height="([^"]+)"/)
  if (widthMatch && heightMatch && !svg.includes('viewBox')) {
    const width = parseFloat(widthMatch[1])
    const height = parseFloat(heightMatch[1])
    svg = svg.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`)
  }

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

  return (
    <>
      <PageSEO
        title="Map - OpenSats"
        description="Countries where OpenSats has awarded grants."
      />

      <div>
        <div className="pb-6 pt-6">
          <StatsSentence className="text-2xl leading-9 text-gray-500 dark:text-gray-400 sm:text-3xl md:text-4xl md:leading-relaxed" />
        </div>

        <div className="pt-6">
          <div
            className="grant-map"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>

      <style jsx global>{`
        .grant-map {
          width: 100%;
        }

        .grant-map svg {
          width: 100%;
          height: auto;
          display: block;
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
