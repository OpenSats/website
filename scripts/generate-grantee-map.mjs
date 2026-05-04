#!/usr/bin/env node
// Generate transparent grantee-map PNGs from public/maps/world.svg.
//
// Produces three variants for use in newsletter platforms (e.g. Buttondown)
// that don't support SVG: a light, dark, and neutral version. The neutral
// variant is the safest single-PNG choice when you can't swap by
// prefers-color-scheme.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const SOURCE_SVG = path.join(root, 'public', 'maps', 'world.svg')
const OUTPUT_DIR = path.join(
  root,
  'public',
  'static',
  'images',
  'newsletter'
)

const WIDTH = 2400 // render width in pixels

const HIGHLIGHT_COLOR = '#f97316' // tailwind orange-500

// Keep this in sync with components/GranteeMap.tsx
const GRANTEE_COUNTRY_CODES = [
  'US', 'CA', 'DE', 'GB', 'IT', 'JP', 'NL', 'CH', 'CN', 'BR',
  'AR', 'IE', 'HK', 'GE', 'SE', 'ES', 'PT', 'NO', 'GR', 'AU',
  'IN', 'SI', 'KR', 'FI', 'CZ', 'UG', 'BE', 'FR', 'VN', 'UA',
  'TR', 'SV', 'NZ', 'HU', 'SK', 'NG', 'PA', 'RO', 'GT', 'ID',
  'AE',
]

const VARIANTS = [
  {
    name: 'grantee-map-light',
    base: '#d4d4d8', // zinc-300 — sits softly on white/cream
    baseOpacity: 1,
  },
  {
    name: 'grantee-map-dark',
    base: '#404040', // neutral-700 — sits softly on dark-mode black/charcoal
    baseOpacity: 1,
  },
  {
    name: 'grantee-map-neutral',
    base: '#9ca3af', // gray-400 — readable on either background
    baseOpacity: 0.6,
  },
]

function escapeForCss(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&')
}

function buildStyledSvg(rawSvg, variant) {
  // Strip XML declaration so resvg doesn't choke on the `<?xml ?>` prologue.
  let svg = rawSvg.replace(/<\?xml[\s\S]*?\?>\s*/i, '').trim()

  // Strip the inline width/height — viewBox alone gives resvg the aspect
  // ratio it needs and fitTo controls the output resolution.
  svg = svg
    .replace(/\s+width="[^"]+"/, '')
    .replace(/\s+height="[^"]+"/, '')

  // Make sure a viewBox exists; fall back to the original width/height
  // if mapsvg's source somehow ships without one.
  if (!/viewBox=/.test(svg)) {
    const widthMatch = rawSvg.match(/width="([^"]+)"/)
    const heightMatch = rawSvg.match(/height="([^"]+)"/)
    if (widthMatch && heightMatch) {
      const w = parseFloat(widthMatch[1])
      const h = parseFloat(heightMatch[1])
      svg = svg.replace('<svg', `<svg viewBox="0 0 ${w} ${h}"`)
    }
  }

  const highlightSelector = GRANTEE_COUNTRY_CODES
    .map((code) => `#${escapeForCss(code)}`)
    .join(', ')

  // Inject a stylesheet right after the opening <svg ...> tag. resvg-js
  // supports SVG <style> elements with simple selectors.
  const css = `
    path {
      fill: ${variant.base};
      fill-opacity: ${variant.baseOpacity};
      stroke: none;
    }
    ${highlightSelector} {
      fill: ${HIGHLIGHT_COLOR};
      fill-opacity: 1;
    }
  `

  return svg.replace(
    /<svg([^>]*)>/,
    `<svg$1><style><![CDATA[${css}]]></style>`
  )
}

async function main() {
  const rawSvg = await fs.readFile(SOURCE_SVG, 'utf8')
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  for (const variant of VARIANTS) {
    const styledSvg = buildStyledSvg(rawSvg, variant)
    const resvg = new Resvg(styledSvg, {
      fitTo: { mode: 'width', value: WIDTH },
      background: 'rgba(0,0,0,0)', // transparent
    })
    const png = resvg.render().asPng()
    const outPath = path.join(OUTPUT_DIR, `${variant.name}.png`)
    await fs.writeFile(outPath, png)
    const kb = (png.byteLength / 1024).toFixed(1)
    console.log(`  wrote ${path.relative(root, outPath)}  (${kb} KB)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
