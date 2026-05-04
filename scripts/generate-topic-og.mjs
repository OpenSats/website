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
  faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(
    faviconSvg
  ).toString('base64')}`
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

// Light-mode palette. Background matches the site's light theme; text
// is warm near-black/grey so the orange logomark stays the only true
// accent. A faint orange wash in the bottom-right keeps the card from
// feeling sterile.
const COLORS = {
  background: '#fafaf9',
  title: '#0c0a09',
  summary: '#44403c',
  url: '#a8a29e',
  separator: '#e7e5e4',
  accent: '#f97316',
}

const PADDING = 84
const CONTENT_WIDTH = WIDTH - PADDING * 2

function backgroundDecor() {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.background}" />
    <circle cx="1140" cy="610" r="220" fill="${COLORS.accent}" fill-opacity="0.07" />
    <circle cx="1080" cy="540" r="120" fill="${COLORS.accent}" fill-opacity="0.05" />
  `
}

function renderTopicSvg(topic) {
  const titleLines = wrapText(topic.title, 22, 2)
  const topicUrl = `opensats.org/topics/${topic.slug}`

  const logoSize = 88
  const logoX = PADDING
  const logoY = PADDING + 8
  const logoBottom = logoY + logoSize

  const titleFontSize = titleLines.length > 1 ? 80 : 96
  const titleLineHeight = titleLines.length > 1 ? 92 : 108
  const titleStartY = logoBottom + (titleLines.length > 1 ? 96 : 112)

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${
          index === 0 ? 0 : titleLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  const titleBottomY = titleStartY + (titleLines.length - 1) * titleLineHeight
  const summaryStartY = titleBottomY + 56
  const summaryLineHeight = 42
  const urlY = 568
  const separatorY = urlY - 36
  const summaryAvailable = separatorY - summaryStartY - 24
  const maxSummaryLines = Math.max(
    0,
    Math.floor(summaryAvailable / summaryLineHeight)
  )
  const summaryLines =
    maxSummaryLines > 0 && topic.summary
      ? wrapText(topic.summary, 52, maxSummaryLines)
      : []

  const summarySvg = summaryLines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${
          index === 0 ? 0 : summaryLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDecor()}

      <image href="${faviconDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />

      <text x="${PADDING}" y="${titleStartY}" fill="${
    COLORS.title
  }" font-size="${titleFontSize}" font-weight="900" font-family="Inter 18pt" letter-spacing="-3">
        ${titleSvg}
      </text>

      ${
        summaryLines.length > 0
          ? `<text x="${PADDING}" y="${summaryStartY}" fill="${COLORS.summary}" font-size="30" font-family="Inter 18pt">
              ${summarySvg}
            </text>`
          : ''
      }

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${PADDING}" y="${urlY}" fill="${
    COLORS.url
  }" font-size="22" font-family="Inter 18pt" letter-spacing="1">${escapeXml(
    topicUrl
  )}</text>
    </svg>
  `
}

function renderIndexSvg() {
  const logoSize = 88
  const logoX = PADDING
  const logoY = PADDING + 8

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDecor()}

      <image href="${faviconDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />

      <text x="${PADDING}" y="320" fill="${
    COLORS.title
  }" font-size="120" font-weight="900" font-family="Inter 18pt" letter-spacing="-4">
        Topics
      </text>

      <text x="${PADDING}" y="384" fill="${
    COLORS.summary
  }" font-size="30" font-family="Inter 18pt">
        Short definitions for technical terms
      </text>
      <text x="${PADDING}" y="426" fill="${
    COLORS.summary
  }" font-size="30" font-family="Inter 18pt">
        that show up in our blog posts.
      </text>

      <rect x="${PADDING}" y="532" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${PADDING}" y="568" fill="${
    COLORS.url
  }" font-size="22" font-family="Inter 18pt" letter-spacing="1">
        opensats.org/topics
      </text>
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
