import fs from 'node:fs/promises'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { ROOT } from './og-network.mjs'

export const WORLD_SVG_PATH = path.join(ROOT, 'public', 'maps', 'world.svg')

export const WORLD_MAP_ASPECT = 1009.6727 / 665.96301

// Keep in sync with pages/map.tsx and components/GranteeMap.tsx
export const GRANTEE_COUNTRY_CODES = [
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

function escapeForCss(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&')
}

export async function loadWorldSvg() {
  const rawSvg = await fs.readFile(WORLD_SVG_PATH, 'utf8')
  let svg = rawSvg.replace(/<\?xml[\s\S]*?\?>\s*/i, '').trim()

  svg = svg.replace(/\s+width="[^"]+"/, '').replace(/\s+height="[^"]+"/, '')

  if (!/viewBox=/.test(svg)) {
    const widthMatch = rawSvg.match(/width="([^"]+)"/)
    const heightMatch = rawSvg.match(/height="([^"]+)"/)
    if (widthMatch && heightMatch) {
      const w = parseFloat(widthMatch[1])
      const h = parseFloat(heightMatch[1])
      svg = svg.replace('<svg', `<svg viewBox="0 0 ${w} ${h}"`)
    }
  }

  return svg
}

export function buildStyledGranteeMapSvg(
  rawSvg,
  {
    base = '#e5e7eb',
    baseOpacity = 1,
    highlight = '#f97316',
    stroke = '#ffffff',
    strokeWidth = 0.5,
  } = {}
) {
  const highlightSelector = GRANTEE_COUNTRY_CODES.map(
    (code) => `#${escapeForCss(code)}`
  ).join(', ')

  const css = `
    path {
      fill: ${base};
      fill-opacity: ${baseOpacity};
      stroke: ${stroke};
      stroke-width: ${strokeWidth};
    }
    ${highlightSelector} {
      fill: ${highlight};
      fill-opacity: 1;
    }
  `

  return svgWithStyles(rawSvg, css)
}

function svgWithStyles(rawSvg, css) {
  return rawSvg.replace(
    /<svg([^>]*)>/,
    `<svg$1><style><![CDATA[${css}]]></style>`
  )
}

export function renderGranteeMapPng(styledSvg, width) {
  const resvg = new Resvg(styledSvg, {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(0,0,0,0)',
  })
  return resvg.render().asPng()
}

export async function renderGranteeMapDataUri(style, width) {
  const rawSvg = await loadWorldSvg()
  const styledSvg = buildStyledGranteeMapSvg(rawSvg, style)
  const png = renderGranteeMapPng(styledSvg, width)
  return `data:image/png;base64,${png.toString('base64')}`
}
