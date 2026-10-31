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
      <!-- Chanterelle: wavy funnel cap and ridges running into the stem. -->
      <path d="M 28,135 C 32,120 49,131 56,123 C 66,113 74,132 86,128 C 102,117 107,135 121,129 C 137,126 137,140 125,148 C 105,159 98,175 94,208 L 73,208 C 75,179 59,160 43,153 C 30,149 24,141 28,135 Z" />
      <path d="M 36,137 C 54,144 67,149 81,148 C 99,147 115,139 129,138 M 45,151 C 65,155 78,172 79,192 M 65,151 C 80,160 86,174 84,196 M 111,152 C 94,161 91,180 89,198" stroke-width="2.5" />
      <!-- Morel: elongated irregular cap with a honeycomb surface. -->
      <path d="M 177,163 C 162,158 153,145 157,132 C 151,119 160,108 160,97 C 165,83 166,73 176,67 C 181,55 194,57 201,68 C 214,72 213,85 221,96 C 224,108 233,118 228,130 C 235,145 224,156 207,163 Z" />
      <path d="M 178,163 C 181,180 175,194 177,208 L 205,208 C 209,192 201,177 207,163" />
      <g stroke-width="2.5">
        <path d="M 180,72 L 174,85 L 184,95 L 195,84 L 191,70 Z M 170,94 L 163,109 L 175,119 L 185,105 Z M 200,92 L 188,105 L 199,119 L 214,109 L 211,96 Z M 167,122 L 161,137 L 173,147 L 185,134 L 179,122 Z M 199,125 L 188,138 L 196,153 L 211,144 L 214,127 Z M 219,114 L 225,127 M 181,150 L 183,158" />
      </g>
      <!-- Fly agaric: broad spotted cap and a slender, skirted stem. -->
      <path d="M 255,139 C 260,110 280,91 307,91 C 334,91 355,110 362,139 C 334,150 282,150 255,139 Z" />
      <path d="M 261,140 C 291,143 329,143 356,140" stroke-width="2.5" />
      <path d="M 301,148 C 303,160 301,174 299,187 C 297,197 295,202 295,208 M 315,148 C 313,165 316,180 318,193 C 320,199 321,204 321,208" />
      <path d="M 301,170 C 296,174 292,175 290,178 C 299,181 309,183 325,178 C 321,176 318,173 315,170" stroke-width="3" />
      <g stroke-width="2.5">
        <ellipse cx="307" cy="105" rx="5" ry="3.5" />
        <ellipse cx="284" cy="119" rx="5" ry="3.5" transform="rotate(-20 284 119)" />
        <ellipse cx="330" cy="119" rx="5" ry="3.5" transform="rotate(20 330 119)" />
        <ellipse cx="306" cy="131" rx="5" ry="3" />
        <path d="M 266,133 Q 272,127 276,133 M 339,134 Q 344,128 349,134" />
      </g>
      <path d="M 18,208 L 370,208" stroke-width="3" />
      <g stroke-width="2.5">
        <path d="M 83,210 C 82,240 49,240 48,266 S 76,296 51,327 M 83,222 C 112,248 133,229 153,254 S 170,299 195,307 M 191,210 C 192,238 166,245 173,269 S 214,298 215,330 M 191,229 C 220,244 237,232 252,258 S 276,284 301,281 M 310,210 C 305,240 277,242 284,267 S 324,295 321,321" />
        <path d="M 48,266 C 86,246 108,278 140,276 S 156,257 173,269 M 140,276 C 139,304 110,306 105,332 M 173,269 C 209,257 226,279 252,258 M 195,307 C 224,304 243,280 266,298 S 300,319 321,321 M 105,332 C 143,314 169,340 215,330 S 263,351 285,342 M 301,281 C 326,270 337,280 350,294" />
      </g>
      <g stroke-width="1.5">
        <path d="M 65,244 C 47,247 39,232 26,234 M 48,266 C 28,270 34,290 17,299 M 59,296 C 83,303 72,325 87,338 M 51,327 C 36,337 42,353 28,360 M 105,332 C 93,352 107,359 98,375" />
        <path d="M 119,240 C 122,224 137,226 145,215 M 140,276 C 119,263 111,250 96,257 M 120,310 C 99,301 93,283 81,284 M 153,254 C 165,239 153,228 166,217 M 173,269 C 159,282 147,281 143,294" />
        <path d="M 195,307 C 180,319 192,337 180,353 M 145,327 C 146,348 130,351 135,369 M 215,330 C 205,354 225,359 218,379 M 180,353 C 167,357 166,372 154,376" />
        <path d="M 231,241 C 228,222 243,222 247,214 M 252,258 C 258,238 272,239 275,220 M 284,267 C 300,253 326,262 337,247 M 301,281 C 297,299 282,305 289,319" />
        <path d="M 321,321 C 341,320 341,342 359,345 M 285,342 C 275,356 291,367 286,380 M 266,298 C 258,313 269,325 254,336 M 335,283 C 348,267 358,276 367,263 M 350,294 C 348,311 365,310 370,325" />
      </g>
      <g stroke-width="1" stroke-opacity="0.8">
        <path d="M 35,239 Q 40,223 28,217 M 27,281 Q 15,278 9,283 M 74,317 Q 91,313 95,323 M 40,346 Q 23,341 18,348 M 100,357 Q 85,354 80,362 M 134,356 Q 118,349 115,358" />
        <path d="M 121,230 Q 109,221 111,215 M 158,233 Q 174,231 178,220 M 165,283 Q 175,290 168,299 M 186,333 Q 174,328 168,335 M 212,355 Q 199,357 199,368 M 228,334 Q 234,350 246,350" />
        <path d="M 266,238 Q 251,231 257,223 M 315,259 Q 317,244 327,240 M 337,277 Q 333,265 341,260 M 342,332 Q 355,325 363,332 M 280,363 Q 264,361 264,372 M 287,306 Q 276,299 272,310" />
      </g>
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
