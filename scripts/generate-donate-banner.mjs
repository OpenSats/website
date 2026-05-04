#!/usr/bin/env node
// Generate transparent PNGs of the DonateRecurringButtonV2 banner for use
// in newsletter platforms (e.g. Buttondown) that don't render SVG/HTML
// banners. Mirrors the .donate-banner-v2 geometry from styles/globals.css
// in pure SVG so it doesn't depend on a headless browser.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

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
// Load static-weight Inter faces so resvg's font-weight matching maps
// reliably (its variable-font wght axis support is best-effort). The
// embedded family name on these files is "Inter 18pt", referenced in
// the SVG below.
const FONT_DIR = path.join(root, 'public', 'fonts', 'Inter', 'static')
const FONT_FAMILY = 'Inter 18pt'
const FONT_FILES = [
  'Inter_18pt-Regular.ttf',
  'Inter_18pt-Medium.ttf',
  'Inter_18pt-SemiBold.ttf',
  'Inter_18pt-Bold.ttf',
  'Inter_18pt-ExtraBold.ttf',
  'Inter_18pt-Black.ttf',
].map((f) => path.join(FONT_DIR, f))

// Source dimensions match the .donate-banner-v2 max-width/min-height in
// styles/globals.css (480 x 120). Render at a 2.5x scale for crisp email
// embeds on retina displays.
const WIDTH = 480
const HEIGHT = 120
const SCALE = 2.5
const OUTPUT_WIDTH = Math.round(WIDTH * SCALE)

const VARIANTS = [
  {
    name: 'donate-banner-v2-light',
    bgFrom: '#ffedd5', // orange-100
    bgTo: '#f4f4f5', // neutral-100
    rightColor: '#9a3412', // orange-800
    rightShadow: '#f4f4f5',
  },
  {
    name: 'donate-banner-v2-dark',
    bgFrom: '#431407', // orange-950
    bgTo: '#27272a', // neutral-800
    rightColor: '#fdba74', // orange-300
    rightShadow: '#1c1917',
  },
]

// Banner copy. Mirrors the DonateRecurringButtonV2 default props.
const PRELUDE = 'Click here to'
const CTA = '>_ donate'
const PRE_TAGLINE = 'Help us provide'
const TAGLINE = 'sustainable funding'

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderSvg(variant) {
  // Wedge geometry mirrors the ::after pseudo-element:
  // 420x420 rotated 36deg, positioned at top: -210px, left: -240px.
  // CSS rotates around the element's center (transform-origin: 50% 50%),
  // so in SVG we replicate that with rotate(angle, cx, cy) where (cx, cy)
  // is the wedge's center after the translate.
  const wedgeSize = 420
  const wedgeLeft = -240
  const wedgeTop = -210
  const wedgeCenterX = wedgeLeft + wedgeSize / 2
  const wedgeCenterY = wedgeTop + wedgeSize / 2

  // Type sizing (match CSS rem values; base font-size 16px):
  // - Banner base font: 1.1rem  (~17.6px)
  // - .__left strong (cta): 1.7rem (~27.2px)
  // - .__right strong (tagline): 1.3rem (~20.8px)
  const preludeSize = 17.6
  const ctaSize = 27.2
  const preTaglineSize = 17.6
  const taglineSize = 20.8

  // Padding mirrors `.donate-banner-v2__left/__right` (1rem 1.25rem).
  // Inner content sits within ~half the banner each side, with the orange
  // wedge providing the white-text surface on the left.
  const padX = 20
  const leftX = padX
  const rightX = WIDTH - padX

  // Vertical centering: stack prelude (small) + cta (big) so the visual
  // center of the pair lands on HEIGHT/2.
  const leftLineGap = 8
  const leftStackHeight = preludeSize + leftLineGap + ctaSize
  const leftPreludeBaselineY = (HEIGHT - leftStackHeight) / 2 + preludeSize
  const leftCtaBaselineY =
    leftPreludeBaselineY + leftLineGap + ctaSize * 0.95

  const rightStackHeight = preTaglineSize + leftLineGap + taglineSize
  const rightPreTaglineBaselineY = (HEIGHT - rightStackHeight) / 2 + preTaglineSize
  const rightTaglineBaselineY =
    rightPreTaglineBaselineY + leftLineGap + taglineSize * 0.95

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${WIDTH}"
      height="${HEIGHT}"
      viewBox="0 0 ${WIDTH} ${HEIGHT}"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="${WIDTH}" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${variant.bgFrom}" />
          <stop offset="100%" stop-color="${variant.bgTo}" />
        </linearGradient>
        <linearGradient id="wedge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f97316" />
          <stop offset="100%" stop-color="#c2410c" />
        </linearGradient>
        <clipPath id="banner-clip">
          <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" rx="6" ry="6" />
        </clipPath>
      </defs>

      <g clip-path="url(#banner-clip)">
        <!-- background gradient -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

        <!-- rotated orange wedge -->
        <g transform="rotate(36 ${wedgeCenterX} ${wedgeCenterY})">
          <rect
            x="${wedgeLeft}"
            y="${wedgeTop}"
            width="${wedgeSize}"
            height="${wedgeSize}"
            fill="url(#wedge)"
          />
        </g>

        <!-- left side (on the wedge): white text -->
        <g font-family="${FONT_FAMILY}, Inter, Arial, Helvetica, sans-serif" fill="#ffffff">
          <text
            x="${leftX}"
            y="${leftPreludeBaselineY}"
            font-size="${preludeSize}"
            font-weight="400"
          >${escapeXml(PRELUDE)}</text>
          <text
            x="${leftX}"
            y="${leftCtaBaselineY}"
            font-size="${ctaSize}"
            font-weight="800"
          >${escapeXml(CTA)}</text>
        </g>

        <!-- right side: dark-orange text on the neutral side -->
        <g
          font-family="${FONT_FAMILY}, Inter, Arial, Helvetica, sans-serif"
          fill="${variant.rightColor}"
          text-anchor="end"
        >
          <text
            x="${rightX}"
            y="${rightPreTaglineBaselineY}"
            font-size="${preTaglineSize}"
            font-weight="400"
          >${escapeXml(PRE_TAGLINE)}</text>
          <text
            x="${rightX}"
            y="${rightTaglineBaselineY}"
            font-size="${taglineSize}"
            font-weight="700"
          >${escapeXml(TAGLINE)}</text>
        </g>
      </g>
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
