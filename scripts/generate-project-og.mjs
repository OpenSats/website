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

function renderSvg(project, coverImage) {
  const titleLines = wrapText(project.title, 18, 3)
  const summaryLines = wrapText(project.summary, 34, 4)
  const kicker = escapeXml(project.nym)
  const projectUrl = escapeXml(`opensats.org/projects/${project.slug}`)

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${index === 0 ? 0 : 72}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const summarySvg = summaryLines
    .map(
      (line, index) =>
        `<tspan x="84" dy="${index === 0 ? 0 : 38}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const coverSvg = coverImage
    ? `<image href="${coverImage}" x="764" y="112" width="352" height="352" preserveAspectRatio="xMidYMid slice" clip-path="url(#cover-clip)" />`
    : `<rect x="764" y="112" width="352" height="352" rx="28" fill="#18181b" />
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
          <rect x="764" y="112" width="352" height="352" rx="28" />
        </clipPath>
        <clipPath id="title-clip">
          <rect x="84" y="140" width="600" height="220" />
        </clipPath>
        <clipPath id="summary-clip">
          <rect x="84" y="348" width="600" height="150" />
        </clipPath>
      </defs>

      <rect width="1200" height="630" fill="url(#bg)" />
      <circle cx="1110" cy="92" r="180" fill="#f97316" fill-opacity="0.08" />
      <circle cx="1035" cy="540" r="140" fill="#f97316" fill-opacity="0.06" />

      <rect x="84" y="72" width="236" height="38" rx="19" fill="#1f2937" />
      <circle cx="110" cy="91" r="6" fill="url(#accent)" />
      <text x="128" y="98" fill="#e5e7eb" font-size="20" font-family="Arial, Helvetica, sans-serif">OpenSats funded</text>

      <text x="84" y="192" fill="#fafaf9" font-size="60" font-weight="700" font-family="Arial, Helvetica, sans-serif" clip-path="url(#title-clip)">
        ${titleSvg}
      </text>

      <text x="84" y="386" fill="#d4d4d8" font-size="30" font-family="Arial, Helvetica, sans-serif" clip-path="url(#summary-clip)">
        ${summarySvg}
      </text>

      <rect x="84" y="498" width="560" height="1" fill="#3f3f46" />
      <text x="84" y="536" fill="#a1a1aa" font-size="24" font-family="Arial, Helvetica, sans-serif">${kicker}</text>
      <text x="84" y="570" fill="#71717a" font-size="20" font-family="Arial, Helvetica, sans-serif">${projectUrl}</text>

      <rect x="736" y="84" width="408" height="408" rx="36" fill="#111827" stroke="#27272a" stroke-width="2" />
      ${coverSvg}
      <rect x="764" y="486" width="352" height="38" rx="19" fill="#18181b" />
      <text x="940" y="512" text-anchor="middle" fill="#f4f4f5" font-size="18" font-family="Arial, Helvetica, sans-serif">${escapeXml(
        project.title
      )}</text>
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

async function writeProjectImage(project) {
  let coverImage = null

  try {
    coverImage = await toDataUri(project.coverImage)
  } catch (error) {
    console.warn(`Skipping cover image for ${project.slug}: ${error.message}`)
  }

  const svg = renderSvg(project, coverImage)
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

  for (const project of allProjects) {
    await writeProjectImage(project)
  }

  console.log(`Generated ${allProjects.length} project OG images.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
