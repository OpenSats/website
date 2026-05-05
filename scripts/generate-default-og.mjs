import path from 'node:path'
import {
  ROOT,
  OG_WIDTH,
  OG_HEIGHT,
  PADDING,
  CONTENT_WIDTH,
  COLORS,
  INTER_FONT_FAMILY,
  escapeXml,
  hashString,
  loadWordmarkDataUri,
  networkDecor,
  renderSvgToPng,
  writePng,
} from './lib/og-network.mjs'

// Single static brand image used as the og:image / twitter:image fallback
// for everything that doesn't have a per-slug OG. Kept in the same visual
// family as the topic OGs (light surface, Inter type, faint network
// decoration) but distinct enough to read as the brand mark rather than
// a content page.
const outputPath = path.join(
  ROOT,
  'public',
  'static',
  'images',
  'og-default.png'
)

const TAGLINE = 'Support contributors to Bitcoin and other'
const TAGLINE_LINE_2 = 'free and open-source projects.'
const URL_LABEL = 'opensats.org'

// Wordmark is 1121x161 in the source SVG (~7:1). At 760px wide it
// renders at ~109px tall, which leaves room for the tagline + URL row
// on the same vertical axis without crowding the brand mark.
const WORDMARK_WIDTH = 760
const WORDMARK_ASPECT = 1121 / 161
const WORDMARK_HEIGHT = WORDMARK_WIDTH / WORDMARK_ASPECT
const WORDMARK_X = (OG_WIDTH - WORDMARK_WIDTH) / 2
const WORDMARK_Y = 196

function renderDefaultSvg(wordmarkDataUri) {
  // Two seeded clusters: one in the top-right, one mirrored in the
  // bottom-left. This is intentionally different from the topic OGs
  // (which keep a single cluster on the right) so the brand image
  // reads as "balanced" rather than content-specific.
  const topRight = networkDecor({
    seed: hashString('opensats-default-tr'),
    minX: 760,
    maxX: OG_WIDTH - 60,
    minY: 50,
    maxY: 230,
    spacing: 56,
    jitter: 14,
    dropRate: 0.22,
    centerOffsetX: 30,
    centerOffsetY: 20,
    fadeFactor: 0.95,
  })

  const bottomLeft = networkDecor({
    seed: hashString('opensats-default-bl'),
    minX: 60,
    maxX: 440,
    minY: 400,
    maxY: 580,
    spacing: 56,
    jitter: 14,
    dropRate: 0.22,
    centerOffsetX: -30,
    centerOffsetY: -20,
    fadeFactor: 0.95,
  })

  const taglineY = WORDMARK_Y + WORDMARK_HEIGHT + 76
  const taglineLine2Y = taglineY + 46
  const urlY = 568
  const separatorY = urlY - 36

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${
    COLORS.background
  }" />
      ${topRight}
      ${bottomLeft}

      <image href="${wordmarkDataUri}" x="${WORDMARK_X}" y="${WORDMARK_Y}" width="${WORDMARK_WIDTH}" height="${WORDMARK_HEIGHT}" />

      <text x="${
        OG_WIDTH / 2
      }" y="${taglineY}" text-anchor="middle" fill="${
    COLORS.summary
  }" font-size="34" font-family="${INTER_FONT_FAMILY}" font-weight="500">
        ${escapeXml(TAGLINE)}
      </text>
      <text x="${
        OG_WIDTH / 2
      }" y="${taglineLine2Y}" text-anchor="middle" fill="${
    COLORS.summary
  }" font-size="34" font-family="${INTER_FONT_FAMILY}" font-weight="500">
        ${escapeXml(TAGLINE_LINE_2)}
      </text>

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${
        OG_WIDTH / 2
      }" y="${urlY}" text-anchor="middle" fill="${
    COLORS.url
  }" font-size="24" font-family="${INTER_FONT_FAMILY}" letter-spacing="2">
        ${escapeXml(URL_LABEL)}
      </text>
    </svg>
  `
}

async function main() {
  const wordmarkDataUri = await loadWordmarkDataUri()
  const svg = renderDefaultSvg(wordmarkDataUri)
  await writePng(outputPath, renderSvgToPng(svg))
  console.log('Generated default OG image at', path.relative(ROOT, outputPath))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
