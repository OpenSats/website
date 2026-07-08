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
import {
  buildStyledGranteeMapSvg,
  loadWorldSvg,
  renderGranteeMapPng,
} from './lib/grantee-map.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const OUTPUT_DIR = path.join(root, 'public', 'static', 'images', 'newsletter')

const VARIANTS = [
  {
    name: 'grantee-map-light',
    base: '#d4d4d8',
    baseOpacity: 1,
    stroke: 'none',
    strokeWidth: 0,
  },
  {
    name: 'grantee-map-dark',
    base: '#404040',
    baseOpacity: 1,
    stroke: 'none',
    strokeWidth: 0,
  },
  {
    name: 'grantee-map-neutral',
    base: '#9ca3af',
    baseOpacity: 0.6,
    stroke: 'none',
    strokeWidth: 0,
  },
]

const WIDTH = 2400

async function main() {
  const rawSvg = await loadWorldSvg()
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  for (const variant of VARIANTS) {
    const styledSvg = buildStyledGranteeMapSvg(rawSvg, variant)
    const png = renderGranteeMapPng(styledSvg, WIDTH)
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
