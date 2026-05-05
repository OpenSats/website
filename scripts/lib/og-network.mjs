import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const ROOT = path.resolve(__dirname, '..', '..')

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
export const PADDING = 84
export const CONTENT_WIDTH = OG_WIDTH - PADDING * 2

// Shared light-mode palette used by every "topic-style" OG generator
// (topics, pages, authors, funds-as-fund, default brand image). Background
// matches the site's light theme; text is warm near-black/grey so the
// orange logomark stays the only true accent.
export const COLORS = {
  background: '#fafaf9',
  title: '#0c0a09',
  summary: '#44403c',
  url: '#a8a29e',
  separator: '#e7e5e4',
  accent: '#f97316',
  network: '#d6d3d1',
}

// Bundle Inter so resvg renders identically on macOS and Vercel's
// Linux build env (where Arial isn't installed).
export const INTER_FONT_FAMILY = 'Inter 18pt'
export const INTER_FONT_FILES = [
  'Inter_18pt-Regular.ttf',
  'Inter_18pt-Medium.ttf',
  'Inter_18pt-SemiBold.ttf',
  'Inter_18pt-Bold.ttf',
  'Inter_18pt-ExtraBold.ttf',
  'Inter_18pt-Black.ttf',
].map((f) => path.join(ROOT, 'public', 'fonts', 'Inter', 'static', f))

const FAVICON_PATH = path.join(
  ROOT,
  'public',
  'static',
  'brand',
  'opensats-favicon.svg'
)

const WORDMARK_PATH = path.join(
  ROOT,
  'public',
  'static',
  'brand',
  'opensats-wordmark.svg'
)

export async function loadFaviconDataUri() {
  const svg = await fs.readFile(FAVICON_PATH, 'utf8')
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export async function loadWordmarkDataUri() {
  const svg = await fs.readFile(WORDMARK_PATH, 'utf8')
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

// Reads any image asset under public/ and returns a data URI suitable
// for embedding in an SVG <image href>. Returns null when the path is
// missing or the mime type is unknown so callers can fall back gracefully.
export async function publicAssetToDataUri(publicPath) {
  if (!publicPath) return null
  const filePath = path.join(ROOT, 'public', publicPath.replace(/^\//, ''))
  const extension = path.extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[extension]
  if (!mimeType) return null
  try {
    const buffer = await fs.readFile(filePath)
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

export function escapeXml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// Wrap `text` greedily into at most `maxLines` lines of at most
// `maxCharsPerLine` characters. Throws when the text doesn't fit so the
// build fails loudly instead of silently truncating copy. The fix is
// always to shorten the source string (or its OG override) so it fits
// the layout budget. Pass `context` (e.g. a slug or field name) to make
// the error message actionable.
export function wrapText(text, maxCharsPerLine, maxLines, context = '') {
  const normalized = (text || '').replace(/\s+/g, ' ').trim()
  const words = normalized.split(' ').filter(Boolean)
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
      current = ''
    }

    current = word
  }

  if (current) {
    lines.push(current)
  }

  const overflowsWidth = lines.some((line) => line.length > maxCharsPerLine)
  if (lines.length > maxLines || overflowsWidth) {
    const where = context ? ` for ${context}` : ''
    throw new Error(
      `OG text does not fit${where}: needs ${lines.length} line(s) at ` +
        `${maxCharsPerLine} chars/line, budget is ${maxLines}. ` +
        `Shorten the source copy (or its OG override) so it fits.\n` +
        `  text: ${JSON.stringify(normalized)}`
    )
  }

  return lines
}

// Tiny seeded PRNG (LCG). Deterministic for a given seed, so each slug
// renders the same network on every build but every slug gets its own
// unique cluster.
export function makeRng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// djb2 string hash → 32-bit unsigned int. Used to derive a per-slug
// PRNG seed from any string identifier.
export function hashString(value = '') {
  let h = 5381
  for (let i = 0; i < value.length; i++) {
    h = (h * 33 + value.charCodeAt(i)) >>> 0
  }
  return h
}

// Renders a faint decentralized-network decoration: jittered nodes
// connected to nearby neighbours, with a radial opacity falloff so the
// cluster reads as denser in the middle and dissolves toward the edges.
//
// All bounds and densities are configurable so callers can place the
// cluster wherever the surrounding layout has room.
export function networkDecor({
  seed,
  minX = 720,
  maxX = OG_WIDTH - 60,
  minY = 70,
  maxY = 500,
  spacing = 58,
  jitter = 16,
  dropRate = 0.18,
  centerOffsetX = 20,
  centerOffsetY = -10,
  fadeFactor = 0.92,
  color = COLORS.network,
} = {}) {
  const cx = (minX + maxX) / 2 + centerOffsetX
  const cy = (minY + maxY) / 2 + centerOffsetY
  const fadeRadius = Math.hypot(maxX - cx, maxY - cy) * fadeFactor

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
      )}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(
        1
      )}" stroke="${color}" stroke-width="1" stroke-opacity="${opacity.toFixed(
        2
      )}" />`
    }
  }

  let nodesSvg = ''
  for (const n of nodes) {
    nodesSvg += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(
      1
    )}" r="${n.r.toFixed(
      1
    )}" fill="${color}" fill-opacity="${n.opacity.toFixed(2)}" />`
  }

  return `<g>${edgesSvg}${nodesSvg}</g>`
}

export function backgroundDecor(seed, options = {}) {
  return `
    <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${COLORS.background}" />
    ${networkDecor({ seed, ...options })}
  `
}

export function renderSvgToPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
    font: {
      fontFiles: INTER_FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: INTER_FONT_FAMILY,
    },
  })
  return resvg.render().asPng()
}

// Removes and recreates the directory so stale output never ships.
export async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true })
  await fs.mkdir(dir, { recursive: true })
}

export async function writePng(filePath, png) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, png)
}

export async function loadContentlayerIndex(typeName) {
  const indexPath = path.join(
    ROOT,
    '.contentlayer',
    'generated',
    typeName,
    '_index.json'
  )
  try {
    const file = await fs.readFile(indexPath, 'utf8')
    return JSON.parse(file)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}
