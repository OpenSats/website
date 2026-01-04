import { useEffect, useState } from 'react'

const OPENSATS_ORANGE = '#f97316' // tailwind orange-500

const GRANTEE_COUNTRY_CODES: string[] = [
  'US',
  'CA',
  'DE',
  'GB',
  'IT',
  'JP',
  'NL',
  'CH',
  'CN',
  'BR',
  'AR',
  'IE',
  'HK',
  'GE',
  'SE',
  'ES',
  'PT',
  'NO',
  'GR',
  'AU',
  'IN',
  'SI',
  'KR',
  'FI',
  'CZ',
  'UG',
  'BE',
  'FR',
  'VN',
  'UA',
  'TR',
  'SV',
  'NZ',
  'HU',
  'SK',
  'NG',
  'PA',
  'RO',
  'GT',
  'ID',
  'AE',
]

export default function GranteeMap() {
  const [svg, setSvg] = useState<string>('')

  useEffect(() => {
    fetch('/maps/world.svg')
      .then((res) => res.text())
      .then((text) => {
        let processed = text.replace(/<\?xml[\s\S]*?\?>\s*/i, '').trim()

        const widthMatch = processed.match(/width="([^"]+)"/)
        const heightMatch = processed.match(/height="([^"]+)"/)
        if (widthMatch && heightMatch && !processed.includes('viewBox')) {
          const width = parseFloat(widthMatch[1])
          const height = parseFloat(heightMatch[1])
          processed = processed.replace(
            '<svg',
            `<svg viewBox="0 0 ${width} ${height}"`
          )
        }

        processed = processed.replace(
          /<path([^>]*)\s+title="([^"]*)"([^>]*)\s*\/>/g,
          '<path$1$3><title>$2</title></path>'
        )

        setSvg(processed)
      })
  }, [])

  const highlightSelector = GRANTEE_COUNTRY_CODES.map(
    (c) => `.grant-map svg #${c}`
  ).join(', ')

  const highlightCss = `
    ${highlightSelector} {
      fill: ${OPENSATS_ORANGE} !important;
    }
  `

  if (!svg) return null

  return (
    <>
      <div className="grant-map" dangerouslySetInnerHTML={{ __html: svg }} />
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
          fill: rgb(229 231 235);
          stroke: rgb(255 255 255);
          stroke-width: 0.5;
          transition: fill 120ms ease;
        }

        .dark .grant-map svg path {
          fill: rgb(64 64 64);
          stroke: rgb(23 23 23);
        }

        .grant-map svg path:hover {
          fill: rgb(253 186 116);
        }

        ${highlightCss}
      `}</style>
    </>
  )
}
