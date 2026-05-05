import path from 'node:path'
import {
  ROOT,
  OG_WIDTH,
  OG_HEIGHT,
  ensureCleanDir,
  escapeXml,
  loadContentlayerIndex,
  publicAssetToDataUri,
  renderSvgToPng,
  wrapText,
  writePng,
} from './lib/og-network.mjs'

// Funds share the visual treatment of project OGs (dark surface, accent
// glows, square cover art) so listings of funds and projects feel like
// part of one family. The only differences are: the kicker chip reads
// "OpenSats fund" instead of "OpenSats funded", and the URL points at
// /funds/<slug>.
const outputDir = path.join(ROOT, 'public', 'static', 'images', 'funds', 'og')

const LOGOMARK_SIZE = 88

function renderSvg(fund, coverImage, logomark) {
  const titleLines = wrapText(fund.title, 18, 3)
  const summaryLines = wrapText(fund.summary, 36, 3)
  const kicker = escapeXml(fund.nym)
  const fundUrl = escapeXml(`opensats.org/funds/${fund.slug}`)
  const titleStartY = 192
  const titleFontSize = titleLines.length > 1 ? 52 : 56
  const titleLineHeight = titleLines.length > 1 ? 60 : 66
  const titleClipWidth = 624
  const separatorY = 498
  const titleBottomY = titleStartY + (titleLines.length - 1) * titleLineHeight
  const summaryStartY = titleBottomY + 56
  const summaryClipY = summaryStartY - 30
  const summaryClipHeight = separatorY - summaryClipY - 24
  const coverInset = 0
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
        `<tspan x="84" dy="${index === 0 ? 0 : 38}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const coverSvg = coverImage
    ? `<rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="28" fill="#0b1220" />
       <image href="${coverImage}" x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#cover-clip)" />`
    : `<rect x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" rx="28" fill="#18181b" />
       <text x="940" y="300" text-anchor="middle" fill="#a1a1aa" font-size="28" font-family="Arial, Helvetica, sans-serif">OpenSats fund</text>`

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#bg)" />
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
      <text x="84" y="570" fill="#71717a" font-size="20" font-family="Arial, Helvetica, sans-serif">${fundUrl}</text>

      <rect x="736" y="84" width="408" height="408" rx="36" fill="#111827" stroke="#27272a" stroke-width="2" />
      ${coverSvg}
      <rect x="764" y="486" width="352" height="38" rx="19" fill="#18181b" />
      <text x="940" y="512" text-anchor="middle" fill="#f4f4f5" font-size="18" font-family="Arial, Helvetica, sans-serif">Donate today!</text>
    </svg>
  `
}

async function writeFundImage(fund, logomark) {
  const coverImage = await publicAssetToDataUri(fund.coverImage)
  if (!coverImage && fund.coverImage) {
    console.warn(`Skipping cover image for ${fund.slug}: ${fund.coverImage}`)
  }

  const svg = renderSvg(fund, coverImage, logomark)
  const png = renderSvgToPng(svg)
  await writePng(path.join(outputDir, `${fund.slug}.png`), png)
}

async function main() {
  const funds = await loadContentlayerIndex('Fund')
  await ensureCleanDir(outputDir)

  const logomark = await publicAssetToDataUri(
    '/static/brand/opensats-favicon.png'
  )
  if (!logomark) {
    throw new Error(
      'Missing logomark at public/static/brand/opensats-favicon.png; cannot render fund OGs.'
    )
  }

  for (const fund of funds) {
    await writeFundImage(fund, logomark)
  }

  console.log(`Generated ${funds.length} fund OG images.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
