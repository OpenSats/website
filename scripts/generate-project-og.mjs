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
  'projects',
  'og'
)
const projectsIndexPath = path.join(
  root,
  '.contentlayer',
  'generated',
  'Project',
  '_index.json'
)

const WIDTH = 1200
const HEIGHT = 630

const mimeTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
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
  const normalized = (text || '').replace(/\s+/g, ' ').trim()
  const words = normalized.split(' ').filter(Boolean)
  const lines = []
  let current = ''
  let truncated = false

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      current = candidate
      continue
    }

    if (current) {
      lines.push(current)
      current = ''
      if (lines.length === maxLines) {
        truncated = true
        break
      }
    }

    current = word
  }

  if (current) {
    if (lines.length < maxLines) {
      lines.push(current)
    } else {
      truncated = true
    }
  }

  if (truncated && lines.length > 0) {
    lines[lines.length - 1] = appendEllipsis(
      lines[lines.length - 1],
      maxCharsPerLine
    )
  }

  return lines
}

function appendEllipsis(line, maxCharsPerLine) {
  let trimmed = line.replace(/[\s.,;:!?…]+$/, '')
  while (trimmed.length + 1 > maxCharsPerLine) {
    const lastSpace = trimmed.lastIndexOf(' ')
    if (lastSpace === -1) {
      trimmed = trimmed.slice(0, Math.max(0, maxCharsPerLine - 1))
      break
    }
    trimmed = trimmed.slice(0, lastSpace).replace(/[\s.,;:!?]+$/, '')
  }
  return `${trimmed}…`
}

async function toDataUri(publicPath) {
  const filePath = path.join(root, 'public', publicPath.replace(/^\//, ''))
  const extension = path.extname(filePath).toLowerCase()
  const mimeType = mimeTypes[extension]

  if (!mimeType) {
    return null
  }

  const buffer = await fs.readFile(filePath)
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

// Pick the cover that best matches the OG card's dark background:
//
// 1. A dedicated `darkCoverImage` (e.g. Satoshi Nakamoto Institute's
//    light-on-dark variant) wins when set.
// 2. Otherwise, an SVG cover with `invertDarkImage: true` gets its
//    dark hex fills swapped for off-white. Mirrors the live site's
//    `dark:invert` behavior without depending on resvg's SVG filter
//    support.
// 3. Otherwise, the cover is embedded as-is.
async function loadCoverImageDataUri(project) {
  if (project.darkCoverImage) {
    return toDataUri(project.darkCoverImage)
  }

  if (!project.coverImage) return null

  const extension = path.extname(project.coverImage).toLowerCase()
  if (extension !== '.svg' || !project.invertDarkImage) {
    return toDataUri(project.coverImage)
  }

  const filePath = path.join(
    root,
    'public',
    project.coverImage.replace(/^\//, '')
  )
  const text = await fs.readFile(filePath, 'utf8')
  const inverted = invertSvgDarkColors(text)
  const base64 = Buffer.from(inverted, 'utf8').toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// Replace any near-black hex fill/stroke in an SVG with the OG card's
// off-white. Uses perceived luminance so the helper generalizes beyond
// any one specific dark hex.
function invertSvgDarkColors(svg) {
  const LIGHT = '#fafaf9'
  const isDark = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b < 50

  return svg
    .replace(/#([0-9a-f]{6})\b/gi, (match, hex) => {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return isDark(r, g, b) ? LIGHT : match
    })
    .replace(/#([0-9a-f]{3})\b/gi, (match, hex) => {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      return isDark(r, g, b) ? LIGHT : match
    })
}

const LOGOMARK_SIZE = 56

function renderSvg(project, coverImage, logomark) {
  const titleLines = wrapText(project.title, 18, 3)
  const kicker = escapeXml(project.nym)
  const projectUrl = escapeXml(`opensats.org/projects/${project.slug}`)
  const titleStartY = 192
  const titleFontSize = titleLines.length > 1 ? 52 : 56
  const titleLineHeight = titleLines.length > 1 ? 60 : 66
  const titleClipWidth = 624
  const separatorY = 498
  const titleBottomY = titleStartY + (titleLines.length - 1) * titleLineHeight
  const summaryStartY = titleBottomY + 56
  const summaryLineHeight = 38
  const summaryClipY = summaryStartY - 30
  const summaryClipHeight = separatorY - summaryClipY - 24
  // Fit as many summary lines as the vertical space below the title
  // allows. wrapText still appends "…" if even this expanded count
  // can't hold the full text, so the copy never reads as cut off.
  const maxSummaryLines = Math.max(
    1,
    Math.floor((separatorY - summaryStartY - 24) / summaryLineHeight)
  )
  const summaryLines = wrapText(project.summary, 36, maxSummaryLines)
  const coverInsetBySlug = {
    cdk: 14,
    grapheneos: 20,
    opencash: 20,
    tor: 20,
  }
  const coverInset = coverInsetBySlug[project.slug] ?? 0
  const coverX = 790 + coverInset
  const coverY = 138 + coverInset
  const coverSize = 300 - coverInset * 2

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(
          line
        )}</tspan>`
    )
    .join('')

  const summarySvg = summaryLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${
          index === 0 ? 0 : summaryLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  const coverSvg = coverImage
    ? `<rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="28" fill="#0b1220" />
       <image href="${coverImage}" x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#cover-clip)" />`
    : `<rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="28" fill="#18181b" />
       <text x="940" y="300" text-anchor="middle" fill="#a1a1aa" font-size="28" font-family="Arial, Helvetica, sans-serif">OpenSats funded</text>`

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop stop-color="#09090b" />
          <stop offset="1" stop-color="#171717" />
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#f97316" />
          <stop offset="1" stop-color="#fb923c" />
        </linearGradient>
        <clipPath id="cover-clip">
          <rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="28" />
        </clipPath>
        <clipPath id="title-clip">
          <rect x="84" y="140" width="${titleClipWidth}" height="220" />
        </clipPath>
        <clipPath id="summary-clip">
          <rect x="84" y="${summaryClipY}" width="600" height="${summaryClipHeight}" />
        </clipPath>
      </defs>

      <rect width="1200" height="630" fill="url(#bg)" />
      <circle cx="1110" cy="92" r="180" fill="#f97316" fill-opacity="0.08" />
      <circle cx="1035" cy="540" r="140" fill="#f97316" fill-opacity="0.06" />

      <image href="${logomark}" x="84" y="72" width="${LOGOMARK_SIZE}" height="${LOGOMARK_SIZE}" />

      <text x="84" y="${titleStartY}" fill="#fafaf9" font-size="${titleFontSize}" font-weight="700" font-family="Arial, Helvetica, sans-serif" clip-path="url(#title-clip)">
        ${titleSvg}
      </text>

      <text x="84" y="${summaryStartY}" fill="#d4d4d8" font-size="30" font-family="Arial, Helvetica, sans-serif" clip-path="url(#summary-clip)">
        ${summarySvg}
      </text>

      <rect x="84" y="${separatorY}" width="560" height="1" fill="#3f3f46" />
      <text x="84" y="536" fill="#a1a1aa" font-size="24" font-family="Arial, Helvetica, sans-serif">${kicker}</text>
      <text x="84" y="570" fill="#71717a" font-size="20" font-family="Arial, Helvetica, sans-serif">${projectUrl}</text>

      <rect x="736" y="84" width="408" height="408" rx="36" fill="#0b1220" stroke="#27272a" stroke-width="2" />
      ${coverSvg}
    </svg>
  `
}

async function ensureOutputDir() {
  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })
}

async function loadProjects() {
  const file = await fs.readFile(projectsIndexPath, 'utf8')
  return JSON.parse(file)
}

async function writeProjectImage(project, logomark) {
  let coverImage = null

  try {
    coverImage = await loadCoverImageDataUri(project)
  } catch (error) {
    console.warn(`Skipping cover image for ${project.slug}: ${error.message}`)
  }

  const svg = renderSvg(project, coverImage, logomark)
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  })

  const pngData = resvg.render().asPng()
  const outputPath = path.join(outputDir, `${project.slug}.png`)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, pngData)
}

async function main() {
  const allProjects = await loadProjects()
  await ensureOutputDir()

  const logomark = await toDataUri('/static/brand/opensats-favicon.png')
  if (!logomark) {
    throw new Error(
      'Missing logomark at public/static/brand/opensats-favicon.png; cannot render project OGs.'
    )
  }

  for (const project of allProjects) {
    await writeProjectImage(project, logomark)
  }

  console.log(`Generated ${allProjects.length} project OG images.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
