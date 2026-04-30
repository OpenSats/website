#!/usr/bin/env node
// Generate transparent PNGs of the "View Heartbeat" button for use in
// newsletter platforms (e.g. Buttondown) that don't render SVG/HTML
// buttons. Mirrors the ViewHeartbeatButton component in components/
// (outlined, font-semibold "View Heartbeat" with the FontAwesome
// heart-pulse glyph). Three variants are produced so the button can be
// swapped via prefers-color-scheme or chosen per-template.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import { faHeartPulse } from '@fortawesome/free-solid-svg-icons'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const OUTPUT_DIR = path.join(
  root,
  'public',
  'static',
  'images',
  'newsletter'
)

// See generate-donate-banner.mjs for the rationale behind embedding
// static-weight Inter faces under the "Inter 18pt" family.
const FONT_DIR = path.join(root, 'public', 'fonts', 'Inter', 'static')
const FONT_FAMILY = 'Inter 18pt'
const FONT_FILES = [
  'Inter_18pt-Regular.ttf',
  'Inter_18pt-Medium.ttf',
  'Inter_18pt-SemiBold.ttf',
  'Inter_18pt-Bold.ttf',
].map((f) => path.join(FONT_DIR, f))

// Logical button geometry roughly mirrors the in-page button
// (rounded 4px, 1.5px stroke, font-semibold 16px "View Heartbeat",
// 18x18 icon, 8px gap). Rendered at 2.5x for crisp retina embeds.
const WIDTH = 240
const HEIGHT = 56
const SCALE = 2.5
const OUTPUT_WIDTH = Math.round(WIDTH * SCALE)

const RADIUS = 4
const STROKE = 1.5
const ICON_SIZE = 18
const ICON_GAP = 8
const FONT_SIZE = 16
const LABEL = 'View Heartbeat'

// FontAwesome icon shape: [viewBoxWidth, viewBoxHeight, ligatures,
// unicode, svgPathData]. heart-pulse is 512x512 today.
const [ICON_VB_W, ICON_VB_H, , , ICON_PATH] = faHeartPulse.icon

// Tuned so the icon + text group lands visually centered in the
// 240x56 box at Inter SemiBold 16px. Bump if you change LABEL.
const TEXT_WIDTH_ESTIMATE = 124

const VARIANTS = [
  {
    name: 'open-heartbeat-light',
    color: '#1c1917', // stone-900, matches the in-page light-mode button
    fill: 'none',
  },
  {
    name: 'open-heartbeat-dark',
    color: '#ffffff',
    fill: 'none',
  },
  {
    // Universal: dark border + dark glyph on a white pill, so the
    // button stays legible on both white and dark email backgrounds.
    name: 'open-heartbeat-neutral',
    color: '#1c1917',
    fill: '#ffffff',
  },
]

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderSvg(variant) {
  const contentWidth = ICON_SIZE + ICON_GAP + TEXT_WIDTH_ESTIMATE
  const contentX = (WIDTH - contentWidth) / 2

  const iconX = contentX
  const iconY = (HEIGHT - ICON_SIZE) / 2
  // Fit-into-square: scale by the larger dimension so non-square icons
  // (none today, but be defensive) stay inside the ICON_SIZE box.
  const iconScale = ICON_SIZE / Math.max(ICON_VB_W, ICON_VB_H)

  const textX = contentX + ICON_SIZE + ICON_GAP
  // Approximate baseline for vertically-centered text.
  const textY = HEIGHT / 2 + FONT_SIZE * 0.36

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${WIDTH}"
      height="${HEIGHT}"
      viewBox="0 0 ${WIDTH} ${HEIGHT}"
    >
      <rect
        x="${STROKE / 2}"
        y="${STROKE / 2}"
        width="${WIDTH - STROKE}"
        height="${HEIGHT - STROKE}"
        rx="${RADIUS}"
        ry="${RADIUS}"
        fill="${variant.fill}"
        stroke="${variant.color}"
        stroke-width="${STROKE}"
      />
      <g transform="translate(${iconX} ${iconY}) scale(${iconScale})">
        <path d="${ICON_PATH}" fill="${variant.color}" />
      </g>
      <text
        x="${textX}"
        y="${textY}"
        font-family="${FONT_FAMILY}, Inter, Arial, Helvetica, sans-serif"
        font-size="${FONT_SIZE}"
        font-weight="600"
        fill="${variant.color}"
      >${escapeXml(LABEL)}</text>
    </svg>
  `
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  for (const variant of VARIANTS) {
    const svg = renderSvg(variant)
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: OUTPUT_WIDTH },
      background: 'rgba(0,0,0,0)',
      font: {
        fontFiles: FONT_FILES,
        loadSystemFonts: false,
        defaultFontFamily: FONT_FAMILY,
      },
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
