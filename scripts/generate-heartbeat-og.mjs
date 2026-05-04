import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const outputDir = path.join(root, 'public', 'static', 'images', 'heartbeat')
const outputPath = path.join(outputDir, 'og.png')

const faviconSvgPath = path.join(
  root,
  'public',
  'static',
  'brand',
  'opensats-favicon.svg'
)
const heartIconPath = path.join(
  root,
  'components',
  'social-icons',
  'heartbeat.svg'
)

// Bundle Inter so resvg renders the text identically on macOS and on
// Vercel's Linux build env (where Georgia/Arial aren't installed).
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

const WIDTH = 1200
const HEIGHT = 630

async function toDataUri(filePath) {
  const svg = await fs.readFile(filePath, 'utf8')
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// Extracts the FontAwesome path from heartbeat.svg so we can paint it
// directly with our OpenSats orange gradient instead of referencing the
// black-fill source via <image>.
async function loadHeartIconPath() {
  const svg = await fs.readFile(heartIconPath, 'utf8')
  const match = svg.match(/<path[^>]*d="([^"]+)"/)
  if (!match) {
    throw new Error('Failed to extract heart-pulse path from heartbeat.svg')
  }
  return match[1]
}

function renderSvg({ faviconUri, heartPath }) {
  // FontAwesome glyph viewBox is 512x512. We render it inside a 360px
  // square anchored at (760, 150), matching the newsletter envelope
  // composition.
  const heartBoxX = 760
  const heartBoxY = 150
  const heartBoxSize = 360
  const heartScale = heartBoxSize / 512

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop stop-color="#09090b" />
          <stop offset="1" stop-color="#171717" />
        </linearGradient>
        <radialGradient id="orange" cx="0.4" cy="0.35" r="0.85">
          <stop offset="0" stop-color="#ffb200" />
          <stop offset="0.55" stop-color="#ff6b01" />
          <stop offset="1" stop-color="#c2410c" />
        </radialGradient>
      </defs>

      <rect width="1200" height="630" fill="url(#bg)" />
      <circle cx="1110" cy="92" r="180" fill="#f97316" fill-opacity="0.08" />
      <circle cx="1035" cy="540" r="140" fill="#f97316" fill-opacity="0.06" />

      <image href="${faviconUri}" x="84" y="200" width="56" height="56" />

      <text x="84" y="320" fill="#fafaf9" font-size="76" font-weight="900" font-family="Inter 18pt" letter-spacing="-2">
        Heartbeat
      </text>

      <text x="84" y="376" fill="#d4d4d8" font-size="28" font-family="Inter 18pt">
        A live feed of releases, commits, and
      </text>
      <text x="84" y="412" fill="#d4d4d8" font-size="28" font-family="Inter 18pt">
        pull requests from the projects we fund.
      </text>

      <text x="84" y="566" fill="#a1a1aa" font-size="20" font-family="Inter 18pt" letter-spacing="1">
        heartbeat.opensats.org
      </text>

      <g transform="translate(${heartBoxX} ${heartBoxY}) scale(${heartScale})">
        <!-- subtle drop shadow -->
        <g transform="translate(8, 12)" opacity="0.45">
          <path d="${heartPath}" fill="#000000" />
        </g>
        <path d="${heartPath}" fill="url(#orange)" />
      </g>
    </svg>
  `
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true })

  const [faviconUri, heartPath] = await Promise.all([
    toDataUri(faviconSvgPath),
    loadHeartIconPath(),
  ])

  const svg = renderSvg({ faviconUri, heartPath })
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: FONT_FAMILY,
    },
  })
  const png = resvg.render().asPng()
  await fs.writeFile(outputPath, png)

  const kb = (png.byteLength / 1024).toFixed(1)
  console.log(`Generated ${path.relative(root, outputPath)}  (${kb} KB)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
