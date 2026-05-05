import path from 'node:path'
import {
  ROOT,
  OG_WIDTH,
  OG_HEIGHT,
  PADDING,
  CONTENT_WIDTH,
  COLORS,
  INTER_FONT_FAMILY,
  ensureCleanDir,
  escapeXml,
  hashString,
  loadContentlayerIndex,
  loadFaviconDataUri,
  networkDecor,
  publicAssetToDataUri,
  renderSvgToPng,
  wrapText,
  writePng,
} from './lib/og-network.mjs'

// Per-fund share cards for /funds/<slug>. Same light topic-OG family as
// the author cards (light bg, Inter type, faint network decoration in the
// upper right) so funds and authors read as siblings. The circular logo
// on the right takes the slot the avatar holds on author cards.
const outputDir = path.join(ROOT, 'public', 'static', 'images', 'funds', 'og')

const COVER_SIZE = 320
const COVER_CX = OG_WIDTH - PADDING - COVER_SIZE / 2
const COVER_CY = OG_HEIGHT / 2 - 28
const COVER_X = COVER_CX - COVER_SIZE / 2
const COVER_Y = COVER_CY - COVER_SIZE / 2

let faviconDataUri = ''

function renderFundSvg(fund, coverDataUri) {
  // Funds can supply an `ogTitle` override when the canonical `title`
  // doesn't fit on a single line at the OG headline size (e.g.
  // "Operations Budget" → "Ops Budget"). Falls back to `title` so most
  // funds need no extra frontmatter.
  const headline = fund.ogTitle || fund.title
  const titleLines = wrapText(headline, 16, 2)
  const fundUrl = `opensats.org/funds/${fund.slug}`
  const seed = hashString(`fund:${fund.slug}`)

  const logoSize = 80
  const logoX = PADDING
  const logoY = PADDING + 8
  const logoBottom = logoY + logoSize

  const titleFontSize = titleLines.length > 1 ? 76 : 92
  const titleLineHeight = titleLines.length > 1 ? 82 : 100
  const titleStartY = logoBottom + (titleLines.length > 1 ? 80 : 108)

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${
          index === 0 ? 0 : titleLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  const titleBottomY = titleStartY + (titleLines.length - 1) * titleLineHeight
  // Tighter title-to-summary gap on multi-line titles so the summary
  // still has room for a third line on long copy like the ops fund.
  const summaryGap = titleLines.length > 1 ? 40 : 56
  const summaryStartY = titleBottomY + summaryGap
  const summaryLineHeight = 38
  const urlY = 582
  const separatorY = urlY - 36

  // Wrap the summary tightly so it never collides with the circular
  // logo on the right. wrapText appends "…" if even the maxed-out line
  // count can't fit, so the copy never reads as silently cut off.
  const maxSummaryLines = Math.max(
    1,
    Math.floor((separatorY - summaryStartY - 24) / summaryLineHeight)
  )
  const summaryLines = wrapText(fund.summary, 32, maxSummaryLines)

  const summarySvg = summaryLines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${
          index === 0 ? 0 : summaryLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  // Network decoration is constrained to the upper-right wedge so it
  // sits behind the circular logo without crowding the headline.
  const networkSvg = networkDecor({
    seed,
    minX: 700,
    maxX: OG_WIDTH - 30,
    minY: 40,
    maxY: OG_HEIGHT - 60,
    spacing: 60,
    jitter: 14,
    dropRate: 0.22,
    centerOffsetX: 0,
    centerOffsetY: 0,
    fadeFactor: 1.0,
  })

  // Fund covers are square logo marks with solid backgrounds. Slicing
  // them into the circle (same as the author avatar treatment) crops
  // away the rounded source corners and lets the brand color fill the
  // disc, which reads as a real circular logo instead of a square stuck
  // inside a ring.
  const coverSvg = coverDataUri
    ? `<defs>
         <clipPath id="cover-clip">
           <circle cx="${COVER_CX}" cy="${COVER_CY}" r="${COVER_SIZE / 2}" />
         </clipPath>
       </defs>
       <circle cx="${COVER_CX}" cy="${COVER_CY}" r="${
        COVER_SIZE / 2 + 6
      }" fill="${COLORS.background}" />
       <image href="${coverDataUri}" x="${COVER_X}" y="${COVER_Y}" width="${COVER_SIZE}" height="${COVER_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#cover-clip)" />
       <circle cx="${COVER_CX}" cy="${COVER_CY}" r="${
        COVER_SIZE / 2
      }" fill="none" stroke="${COLORS.separator}" stroke-width="2" />`
    : ''

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${
    COLORS.background
  }" />
      ${networkSvg}

      <image href="${faviconDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />

      <text x="${PADDING}" y="${titleStartY}" fill="${
    COLORS.title
  }" font-size="${titleFontSize}" font-weight="900" font-family="${INTER_FONT_FAMILY}" letter-spacing="-3">
        ${titleSvg}
      </text>

      <text x="${PADDING}" y="${summaryStartY}" fill="${
    COLORS.summary
  }" font-size="30" font-family="${INTER_FONT_FAMILY}">
        ${summarySvg}
      </text>

      ${coverSvg}

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${PADDING}" y="${urlY}" fill="${
    COLORS.url
  }" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">${escapeXml(
    fundUrl
  )}</text>
    </svg>
  `
}

async function writeFundImage(fund) {
  const coverDataUri = await publicAssetToDataUri(fund.coverImage)
  if (!coverDataUri && fund.coverImage) {
    console.warn(`Missing cover image for ${fund.slug}: ${fund.coverImage}`)
  }
  const svg = renderFundSvg(fund, coverDataUri)
  await writePng(path.join(outputDir, `${fund.slug}.png`), renderSvgToPng(svg))
}

async function main() {
  await ensureCleanDir(outputDir)
  faviconDataUri = await loadFaviconDataUri()

  const funds = await loadContentlayerIndex('Fund')

  for (const fund of funds) {
    await writeFundImage(fund)
  }

  console.log(`Generated ${funds.length} fund OG images.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
