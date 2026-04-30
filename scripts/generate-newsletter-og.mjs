import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

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

const WIDTH = 1200
const HEIGHT = 630

function escapeXml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function clampText(text = '', maxLength) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

function wrapText(text, maxCharsPerLine, maxLines) {
  const words = clampText(text, maxCharsPerLine * maxLines + maxLines).split(
    ' '
  )
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      current = candidate
      continue
    }

    if (current) {
      lines.push(current)
      if (lines.length === maxLines) {
        return lines
      }
    }

    current = word
  }

  if (current && lines.length < maxLines) {
    lines.push(current)
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines)
  }

  return lines
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

      <text x="84" y="300" fill="#fafaf9" font-size="76" font-weight="700" font-family="Georgia, 'Times New Roman', serif">
        Sats Well Spent
      </text>

      <text x="84" y="356" fill="#d4d4d8" font-size="28" font-family="Arial, Helvetica, sans-serif">
        A quarterly newsletter from OpenSats.
      </text>

      ${loveLetterSvg()}
    </svg>
  `
}

function renderIssueSvg(issue) {
  const issueLabel = formatIssueNumber(issue.issueNumber)
  const kicker = `${issueLabel}  ·  ${issue.quarter}`

  const headlineText = issue.headline || issue.title
  const titleLines = wrapText(headlineText, 18, 2)

  const titleFontSize = titleLines.length > 1 ? 64 : 76
  const titleLineHeight = titleLines.length > 1 ? 72 : 84
  const titleStartY = titleLines.length > 1 ? 280 : 320

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(
          line
        )}</tspan>`
    )
    .join('')

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${baseDefs()}
      ${backgroundDecor()}

      <text x="84" y="${
        titleStartY - 60
      }" fill="#f97316" font-size="22" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="2">
        ${escapeXml(kicker.toUpperCase())}
      </text>

      <text x="84" y="${titleStartY}" fill="#fafaf9" font-size="${titleFontSize}" font-weight="700" font-family="Georgia, 'Times New Roman', serif">
        ${titleSvg}
      </text>

      <text x="84" y="${
        titleStartY + (titleLines.length - 1) * titleLineHeight + 56
      }" fill="#d4d4d8" font-size="28" font-family="Arial, Helvetica, sans-serif">
        Sats Well Spent
      </text>

      ${loveLetterSvg()}
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

  const newsletters = await loadNewsletters()

  await writeImage('index.png', renderIndexSvg())

  for (const issue of newsletters) {
    await writeImage(`${issue.slug}.png`, renderIssueSvg(issue))
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
