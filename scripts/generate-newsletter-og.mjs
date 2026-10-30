import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import { wrapText } from './lib/og-network.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outputDir = path.join(
  root,
  'public',
  'static',
  'images',
  'newsletter',
  'og'
)
const newslettersIndexPath = path.join(
  root,
  '.contentlayer',
  'generated',
  'Newsletter',
  '_index.json'
)
const faviconSvgPath = path.join(
  root,
  'public',
  'static',
  'brand',
  'opensats-favicon.svg'
)
const territoryMapPngPath = path.join(
  root,
  'public',
  'static',
  'images',
  'newsletter',
  'territory-map.png'
)

// Bundle Inter so resvg renders identically on macOS and Vercel's
// Linux build env (where Georgia/Arial aren't installed). Mirrors the
// font pattern used in generate-donate-banner.mjs and
// generate-heartbeat-button.mjs.
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

let faviconDataUri = ''
let territoryMapDataUri = ''

async function loadFavicon() {
  const svg = await fs.readFile(faviconSvgPath, 'utf8')
  faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString(
    'base64'
  )}`
}

async function loadTerritoryMap() {
  const png = await fs.readFile(territoryMapPngPath)
  territoryMapDataUri = `data:image/png;base64,${png.toString('base64')}`
}

function logoMark({ x, y, size }) {
  if (!faviconDataUri) return ''
  return `<image href="${faviconDataUri}" x="${x}" y="${y}" width="${size}" height="${size}" />`
}

function escapeXml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatIssueNumber(issueNumber) {
  return `Issue #${String(issueNumber).padStart(2, '0')}`
}

// Stylized love-letter envelope with an orange heart seal, positioned on the
// right side of the OG card. The artwork mirrors the love-letter emoji while
// swapping the traditional red heart for OpenSats orange.
function loveLetterSvg() {
  // Anchored at (760, 150) inside the 1200x630 canvas.
  return `
    <g transform="translate(760, 150)">
      <!-- soft glow behind the envelope -->
      <ellipse cx="170" cy="180" rx="220" ry="160" fill="#f97316" fill-opacity="0.12" />

      <!-- drop shadow -->
      <rect x="14" y="22" width="340" height="240" rx="14" fill="#000" fill-opacity="0.45" />

      <!-- envelope body -->
      <rect x="0" y="0" width="340" height="240" rx="14" fill="#fff7ed" stroke="#fed7aa" stroke-width="3" />

      <!-- closed flap (V shape from top corners to center) -->
      <path d="M 4,4 L 170,138 L 336,4"
            stroke="#fb923c" stroke-width="4" fill="none"
            stroke-linejoin="round" stroke-linecap="round" />

      <!-- bottom seams of the envelope -->
      <path d="M 4,236 L 138,128" stroke="#fed7aa" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M 336,236 L 202,128" stroke="#fed7aa" stroke-width="3" fill="none" stroke-linecap="round" />

      <!-- heart seal centered over the flap meeting point -->
      <g transform="translate(120, 78)">
        <!-- heart shadow -->
        <path d="M 50,90 C 14,66 4,42 4,24 C 4,10 16,2 28,2 C 38,2 46,8 50,18 C 54,8 62,2 72,2 C 84,2 96,10 96,24 C 96,42 86,66 50,90 Z"
              fill="#000" fill-opacity="0.25" transform="translate(2, 4)" />
        <!-- heart -->
        <path d="M 50,90 C 14,66 4,42 4,24 C 4,10 16,2 28,2 C 38,2 46,8 50,18 C 54,8 62,2 72,2 C 84,2 96,10 96,24 C 96,42 86,66 50,90 Z"
              fill="#f97316" stroke="#c2410c" stroke-width="2" />
        <!-- highlight on the heart -->
        <ellipse cx="26" cy="20" rx="8" ry="5" fill="#ffffff" fill-opacity="0.55" />
      </g>
    </g>
  `
}

function cypherpunkLaptopSvg() {
  return `
    <g transform="translate(760, 150)">
      <ellipse cx="170" cy="180" rx="220" ry="160" fill="#f97316" fill-opacity="0.12" />
      <ellipse cx="170" cy="278" rx="200" ry="12" fill="#000" fill-opacity="0.45" />

      <path d="M 20,240 L 320,240 L 360,272 L -20,272 Z"
            fill="#fff7ed" stroke="#fb923c" stroke-width="3" stroke-linejoin="round" />
      <rect x="138" y="248" width="64" height="6" rx="2" fill="#fed7aa" />

      <rect x="20" y="0" width="300" height="240" rx="14" fill="#fff7ed" stroke="#fed7aa" stroke-width="3" />
      <rect x="34" y="14" width="272" height="212" rx="6" fill="#0f0f11" />

      <g font-family="Inter 18pt">
        <text x="50" y="46"  fill="#fb923c" font-size="18" font-weight="700">$ gpg --gen-key</text>
        <text x="50" y="70"  fill="#a1a1aa" font-size="16">generating keypair...</text>
        <text x="50" y="94"  fill="#a1a1aa" font-size="16">[#########.] 80%</text>
        <text x="50" y="128" fill="#fb923c" font-size="18" font-weight="700">def encrypt(m, k):</text>
        <text x="70" y="150" fill="#fafaf9" font-size="16">return aes(m, k)</text>
        <text x="50" y="184" fill="#fb923c" font-size="18" font-weight="700">$ ./privacy --on</text>
        <text x="50" y="206" fill="#a1a1aa" font-size="16">listening on :1984</text>
      </g>

      <circle cx="170" cy="8" r="2.5" fill="#fb923c" fill-opacity="0.6" />
    </g>
  `
}

// Isometric topographic map for Q2 "Territory of Freedom".
// Artwork derived from a public topo/map icon, recolored to OpenSats orange.
function territoryMapSvg() {
  if (!territoryMapDataUri) return loveLetterSvg()

  // Anchored at (740, 110) inside the 1200x630 canvas.
  const size = 380
  return `
    <g transform="translate(740, 110)">
      <ellipse cx="${size / 2}" cy="${size / 2 + 20}" rx="200" ry="160"
               fill="#f97316" fill-opacity="0.14" />
      <image href="${territoryMapDataUri}"
             x="0" y="0" width="${size}" height="${size}" />
    </g>
  `
}

// Orange outline artwork matching Q2's topographic illustration.
function branchingRootsSvg() {
  return `
    <g transform="translate(740, 80)">
      <g fill="none" stroke="#f97316" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
        <!-- A young tree above an extensive, branching root system. -->
        <g transform="translate(38, 41.6) scale(0.8)">
        <path d="M 190,208 L 190,80" />
        <path d="M 190,163 C 161,160 136,143 124,113 C 159,108 184,127 190,163" />
        <path d="M 190,131 C 218,129 242,111 254,81 C 220,78 195,96 190,131" />
        <path d="M 190,99 C 170,86 164,63 174,39 C 199,53 206,78 190,99" />
        </g>
        <path d="M 18,208 L 362,208" stroke-width="3" />
        <g transform="translate(-38, -41.6) scale(1.2)" stroke-width="4">
        <path d="M 190,208 C 188,239 166,253 150,277 C 135,300 133,325 112,348" />
        <path d="M 190,208 C 194,240 217,252 231,277 C 245,303 251,328 276,349" />
        <path d="M 190,221 C 163,244 128,239 103,259 C 82,276 67,287 42,291" />
        <path d="M 190,225 C 219,245 255,240 282,259 C 302,273 318,285 341,289" />
        <path d="M 155,269 C 124,271 102,293 85,319" />
        <path d="M 130,244 L 112,226" />
        <path d="M 105,259 L 82,252 L 64,233" />
        <path d="M 137,315 L 159,334 L 165,356" />
        <path d="M 190,245 L 190,297 L 178,322" />
        <path d="M 190,282 L 207,306 L 209,335" />
        <path d="M 227,269 C 260,271 280,292 296,319" />
        <path d="M 253,244 L 270,226" />
        <path d="M 282,259 L 306,249 L 321,231" />
        <path d="M 251,317 L 234,338 L 231,357" />
        </g>
      </g>
    </g>
  `
}

// Alternate Q3 concept: three fruiting bodies sharing one mycelium network.
function myceliumSvg() {
  return `
    <g transform="translate(740, 80)" fill="none" stroke="#f97316" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 137,139 C 153,119 170,89 190,72 C 208,88 227,119 246,139 C 211,151 173,151 137,139 Z" />
      <path d="M 181,149 L 177,208 M 201,149 L 206,208" />
      <path d="M 32,165 C 49,145 113,145 133,165 C 113,183 52,183 32,165 Z" />
      <path d="M 75,178 L 73,208 M 90,178 L 94,208" />
      <path d="M 265,157 C 272,122 289,105 309,105 C 333,105 351,130 355,157 C 327,167 293,167 265,157 Z" />
      <path d="M 301,166 L 296,208 M 317,166 L 322,208" />
      <path d="M 18,208 L 370,208" stroke-width="3" />
      <path d="M 83,210 C 83,234 66,245 52,259 L 81,291 L 42,330 M 83,222 C 105,239 119,246 141,252 L 191,228 L 240,253 L 288,231 L 310,210" />
      <path d="M 191,210 L 191,228 L 186,278 L 141,252 L 81,291 L 128,322 L 186,278 L 242,294 L 240,253 L 298,277 L 288,231" />
      <path d="M 298,277 L 341,260 L 360,278 M 298,277 L 325,317 L 282,341 L 242,294 L 214,343 L 128,322 L 107,366" />
      <path d="M 52,259 L 23,251 L 12,232 M 81,291 L 38,290 L 15,305 M 128,322 L 85,339 L 65,367" />
      <path d="M 141,252 L 127,224 M 240,253 L 258,224 M 341,260 L 361,237" />
      <path d="M 214,343 L 187,378 M 214,343 L 238,374 M 282,341 L 292,373 M 325,317 L 357,335 L 369,359" />
      <path d="M 186,278 L 168,303 M 298,277 L 278,299 M 128,322 L 141,357 L 160,372" stroke-width="3" />
    </g>
  `
}

function issueArtwork(slug) {
  if (slug === '2026-Q1') return cypherpunkLaptopSvg()
  if (slug === '2026-Q2') return territoryMapSvg()
  if (slug === '2026-Q3') return branchingRootsSvg()
  return loveLetterSvg()
}

function baseDefs() {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#09090b" />
        <stop offset="1" stop-color="#171717" />
      </linearGradient>
    </defs>
  `
}

function backgroundDecor() {
  return `
    <rect width="1200" height="630" fill="url(#bg)" />
    <circle cx="1110" cy="92" r="180" fill="#f97316" fill-opacity="0.08" />
    <circle cx="1035" cy="540" r="140" fill="#f97316" fill-opacity="0.06" />
  `
}

function renderIndexSvg() {
  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${baseDefs()}
      ${backgroundDecor()}

      ${logoMark({ x: 84, y: 200, size: 56 })}

      <text x="84" y="336" fill="#fafaf9" font-size="76" font-weight="900" font-family="Inter 18pt" letter-spacing="-2">
        Sats Well Spent
      </text>

      <text x="84" y="392" fill="#d4d4d8" font-size="28" font-family="Inter 18pt">
        A quarterly newsletter from OpenSats.
      </text>

      <text x="84" y="566" fill="#a1a1aa" font-size="20" font-family="Inter 18pt" letter-spacing="1">
        opensats.org/newsletter
      </text>

      ${loveLetterSvg()}
    </svg>
  `
}

function renderIssueSvg(issue) {
  const issueLabel = formatIssueNumber(issue.issueNumber)
  const kicker = issue.quarter
  const seriesLabel = `${issue.title}, ${issueLabel}`

  const headlineText = issue.headline || issue.title
  const titleLines = wrapText(
    headlineText,
    14,
    2,
    `newsletter ${issue.slug || issue.issueNumber} headline`
  )

  const titleFontSize = titleLines.length > 1 ? 64 : 76
  const titleLineHeight = titleLines.length > 1 ? 72 : 84
  const titleStartY = titleLines.length > 1 ? 300 : 340

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(
          line
        )}</tspan>`
    )
    .join('')

  const kickerY = titleStartY - 80
  const logoSize = 36
  const logoY = kickerY - logoSize + 8
  const kickerX = 84 + logoSize + 14

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${baseDefs()}
      ${issue.slug === '2026-Q3' ? '<rect width="1200" height="630" fill="url(#bg)" />' : backgroundDecor()}

      ${logoMark({ x: 84, y: logoY, size: logoSize })}

      <text x="${kickerX}" y="${kickerY}" fill="#f97316" font-size="22" font-weight="700" font-family="Inter 18pt" letter-spacing="2">
        ${escapeXml(kicker)}
      </text>

      <text x="84" y="${titleStartY}" fill="#fafaf9" font-size="${titleFontSize}" font-weight="900" font-family="Inter 18pt" letter-spacing="-2">
        ${titleSvg}
      </text>

      <text x="84" y="${
        titleStartY + (titleLines.length - 1) * titleLineHeight + 76
      }" fill="#d4d4d8" font-size="28" font-family="Inter 18pt">
        ${escapeXml(seriesLabel)}
      </text>

      <text x="84" y="566" fill="#a1a1aa" font-size="20" font-family="Inter 18pt" letter-spacing="1">
        opensats.org/newsletter/${escapeXml(issue.slug)}
      </text>

      ${issueArtwork(issue.slug)}
    </svg>
  `
}

async function ensureOutputDir() {
  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })
}

async function loadNewsletters() {
  try {
    const file = await fs.readFile(newslettersIndexPath, 'utf8')
    return JSON.parse(file)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(
        'No newsletter contentlayer index found; only the index OG image will be generated.'
      )
      return []
    }
    throw error
  }
}

function renderToPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: FONT_FAMILY,
    },
  })
  return resvg.render().asPng()
}

async function writeImage(filename, svg) {
  const png = renderToPng(svg)
  const outputPath = path.join(outputDir, filename)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, png)
}

async function main() {
  await ensureOutputDir()
  await loadFavicon()
  await loadTerritoryMap()

  const newsletters = await loadNewsletters()

  await writeImage('index.png', renderIndexSvg())

  for (const issue of newsletters) {
    await writeImage(`${issue.slug}.png`, renderIssueSvg(issue))
    if (issue.slug === '2026-Q3') {
      await writeImage('2026-Q3-mycelium.png', renderIssueSvg(issue).replace(branchingRootsSvg(), myceliumSvg()))
    }
  }

  console.log(
    `Generated newsletter OG images: index + ${newsletters.length} issue${
      newsletters.length === 1 ? '' : 's'
    }.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
