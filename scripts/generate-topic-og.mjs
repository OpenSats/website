import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const outputDir = path.join(root, 'public', 'static', 'images', 'topics', 'og')
const topicsIndexPath = path.join(
  root,
  '.contentlayer',
  'generated',
  'Topic',
  '_index.json'
)
const faviconSvgPath = path.join(
  root,
  'public',
  'static',
  'brand',
  'opensats-favicon.svg'
)

// Bundle Inter so resvg renders identically on macOS and Vercel's
// Linux build env (where Arial isn't installed). Mirrors the font
// pattern used by the newsletter and heartbeat OG generators.
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

async function loadBrandAssets() {
  const faviconSvg = await fs.readFile(faviconSvgPath, 'utf8')
  faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(faviconSvg).toString(
    'base64'
  )}`
}

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

// Right-side brand card mirroring the project OG layout. Instead of a
// project logo we drop in the OpenSats logomark — the orange `>_` mark
// from our favicon, rendered on the dark card with an orange halo.
function brandCard() {
  const cardX = 736
  const cardY = 84
  const cardSize = 408
  const cx = cardX + cardSize / 2
  const cy = cardY + cardSize / 2 - 18
  const markSize = 200
  const markX = cx - markSize / 2
  const markY = cy - markSize / 2
  const labelY = cardY + cardSize - 76

  return `
    <defs>
      <radialGradient id="halo" cx="0.5" cy="0.5" r="0.55">
        <stop offset="0" stop-color="#f97316" stop-opacity="0.45" />
        <stop offset="0.6" stop-color="#f97316" stop-opacity="0.12" />
        <stop offset="1" stop-color="#f97316" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="36" fill="#0f1115" stroke="#27272a" stroke-width="2" />
    <circle cx="${cx}" cy="${cy}" r="180" fill="url(#halo)" />
    <image href="${faviconDataUri}" x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" preserveAspectRatio="xMidYMid meet" />
    <rect x="${cardX + 28}" y="${labelY}" width="${
    cardSize - 56
  }" height="38" rx="19" fill="#18181b" />
    <text x="${cardX + cardSize / 2}" y="${
    labelY + 26
  }" text-anchor="middle" fill="#f4f4f5" font-size="18" font-weight="600" font-family="Inter 18pt" letter-spacing="2">
      OPENSATS
    </text>
  `
}

function renderTopicSvg(topic) {
  const titleLines = wrapText(topic.title, 16, 2)
  const categoryLabel = (topic.category || 'Topic').toUpperCase()
  const topicUrl = `opensats.org/topics/${topic.slug}`

  const titleFontSize = titleLines.length > 1 ? 64 : 76
  const titleLineHeight = titleLines.length > 1 ? 72 : 84
  const titleStartY = 232
  const titleClipWidth = 620

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(
          line
        )}</tspan>`
    )
    .join('')

  const titleBottomY = titleStartY + (titleLines.length - 1) * titleLineHeight
  const summaryStartY = titleBottomY + 64
  const summaryLineHeight = 36
  const separatorY = 498
  const summaryAvailable = separatorY - summaryStartY - 16
  const maxSummaryLines = Math.max(
    0,
    Math.floor(summaryAvailable / summaryLineHeight)
  )
  const summaryLines =
    maxSummaryLines > 0 && topic.summary
      ? wrapText(topic.summary, 36, maxSummaryLines)
      : []

  const summarySvg = summaryLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${
          index === 0 ? 0 : summaryLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  // Top-left "TOPIC · CATEGORY" pill mirrors the project OG "OpenSats funded"
  // badge so the cards feel like a series.
  const pillText = `TOPIC · ${categoryLabel}`
  const charWidth = 8.4
  const pillPadding = 24
  const pillTextWidth = pillText.length * charWidth
  const pillWidth = Math.max(176, Math.round(pillTextWidth + pillPadding * 2))
  const pillX = 84
  const pillY = 96
  const pillTextX = pillX + pillWidth / 2

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${baseDefs()}
      <clipPath id="title-clip">
        <rect x="84" y="${titleStartY - 80}" width="${titleClipWidth}" height="${
    titleLineHeight * titleLines.length + 24
  }" />
      </clipPath>

      ${backgroundDecor()}

      <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="40" rx="20" fill="#1f2937" />
      <text x="${pillTextX}" y="${
    pillY + 27
  }" text-anchor="middle" fill="#fb923c" font-size="18" font-weight="700" font-family="Inter 18pt" letter-spacing="2">
        ${escapeXml(pillText)}
      </text>

      <text x="84" y="${titleStartY}" fill="#fafaf9" font-size="${titleFontSize}" font-weight="900" font-family="Inter 18pt" letter-spacing="-2" clip-path="url(#title-clip)">
        ${titleSvg}
      </text>

      ${
        summaryLines.length > 0
          ? `<text x="84" y="${summaryStartY}" fill="#d4d4d8" font-size="26" font-family="Inter 18pt">
              ${summarySvg}
            </text>`
          : ''
      }

      <rect x="84" y="${separatorY}" width="560" height="1" fill="#3f3f46" />
      <image href="${faviconDataUri}" x="84" y="520" width="32" height="32" />
      <text x="128" y="544" fill="#a1a1aa" font-size="22" font-weight="600" font-family="Inter 18pt">OpenSats Topics</text>
      <text x="84" y="582" fill="#71717a" font-size="20" font-family="Inter 18pt" letter-spacing="1">${escapeXml(
        topicUrl
      )}</text>

      ${brandCard()}
    </svg>
  `
}

function renderIndexSvg() {
  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${baseDefs()}
      ${backgroundDecor()}

      <image href="${faviconDataUri}" x="84" y="200" width="56" height="56" />

      <text x="84" y="320" fill="#fafaf9" font-size="76" font-weight="900" font-family="Inter 18pt" letter-spacing="-2">
        Topics
      </text>

      <text x="84" y="372" fill="#d4d4d8" font-size="28" font-family="Inter 18pt">
        Short definitions for technical terms
      </text>
      <text x="84" y="408" fill="#d4d4d8" font-size="28" font-family="Inter 18pt">
        that show up in our blog posts.
      </text>

      <text x="84" y="566" fill="#a1a1aa" font-size="20" font-family="Inter 18pt" letter-spacing="1">
        opensats.org/topics
      </text>

      ${brandCard()}
    </svg>
  `
}

async function ensureOutputDir() {
  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })
}

async function loadTopics() {
  try {
    const file = await fs.readFile(topicsIndexPath, 'utf8')
    return JSON.parse(file)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(
        'No topic contentlayer index found; only the index OG image will be generated.'
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
  await loadBrandAssets()

  const topics = await loadTopics()

  await writeImage('index.png', renderIndexSvg())

  for (const topic of topics) {
    await writeImage(`${topic.slug}.png`, renderTopicSvg(topic))
  }

  console.log(
    `Generated topic OG images: index + ${topics.length} topic${
      topics.length === 1 ? '' : 's'
    }.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
