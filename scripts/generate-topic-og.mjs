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
// accent. The right-side decoration is a faint decentralized network:
// jittered nodes connected to nearby neighbours, with a radial opacity
// falloff so the cluster reads as denser in the middle and dissolves
// toward the edges.
const COLORS = {
  background: '#fafaf9',
  title: '#0c0a09',
  summary: '#44403c',
  url: '#a8a29e',
  separator: '#e7e5e4',
  accent: '#f97316',
  network: '#d6d3d1',
}

const PADDING = 84
const CONTENT_WIDTH = WIDTH - PADDING * 2

// Tiny seeded PRNG (LCG). Deterministic for a given seed, so each topic
// renders the same network on every build but every topic gets its own
// unique cluster.
function makeRng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// djb2 string hash → 32-bit unsigned int. Used to derive a per-topic
// PRNG seed from the slug.
function hashString(value = '') {
  let h = 5381
  for (let i = 0; i < value.length; i++) {
    h = (h * 33 + value.charCodeAt(i)) >>> 0
  }
  return h
}

function networkDecor(seed) {
  // Bounded region. The Y ceiling stops well above the separator (which
  // sits at ~y=532) so nodes never collide with the URL row.
  const minX = 720
  const maxX = WIDTH - 60
  const minY = 70
  const maxY = 500

  const spacing = 58
  const jitter = 16
  const dropRate = 0.18

  // Falloff anchored slightly off-centre to feel less symmetric.
  const cx = (minX + maxX) / 2 + 20
  const cy = (minY + maxY) / 2 - 10
  const fadeRadius = Math.hypot(maxX - cx, maxY - cy) * 0.92

  const fadeAt = (x, y) => {
    const d = Math.hypot(x - cx, y - cy) / fadeRadius
    if (d >= 1) return 0
    return Math.max(0, 1 - d * d)
  }

  const rand = makeRng(seed)
  const nodes = []
  for (let y = minY; y <= maxY; y += spacing) {
    for (let x = minX; x <= maxX; x += spacing) {
      if (rand() < dropRate) continue
      const jx = (rand() - 0.5) * 2 * jitter
      const jy = (rand() - 0.5) * 2 * jitter
      const nx = x + jx
      const ny = y + jy
      if (ny > maxY || ny < minY) continue
      const f = fadeAt(nx, ny)
      if (f <= 0.04) continue
      nodes.push({
        x: nx,
        y: ny,
        r: 2.4 + rand() * 1.8,
        opacity: f,
      })
    }
  }

  const threshold = spacing * 1.4
  let edgesSvg = ''
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d > threshold) continue
      const linkStrength = 1 - d / threshold
      const opacity = linkStrength * ((a.opacity + b.opacity) / 2) * 0.7
      if (opacity < 0.02) continue
      edgesSvg += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(
        1
      )}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${
        COLORS.network
      }" stroke-width="1" stroke-opacity="${opacity.toFixed(2)}" />`
    }
  }

  let nodesSvg = ''
  for (const n of nodes) {
    nodesSvg += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(
      1
    )}" r="${n.r.toFixed(1)}" fill="${
      COLORS.network
    }" fill-opacity="${n.opacity.toFixed(2)}" />`
  }

  return `<g>${edgesSvg}${nodesSvg}</g>`
}

function backgroundDecor(seed) {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.background}" />
    ${networkDecor(seed)}
  `
}

function renderTopicSvg(topic) {
  const titleLines = wrapText(topic.title, 22, 2)
  const topicUrl = `opensats.org/topics/${topic.slug}`
  const seed = hashString(topic.slug)

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
      ${backgroundDecor(seed)}

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
  const seed = hashString('topics-index')

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDecor(seed)}

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
