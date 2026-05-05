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

// Wordmark is 1121x161 in the source SVG (~7:1). At 580px wide it
// renders at ~83px tall, leaving comfortable room for the tagline + URL
// underneath while keeping the right side free for the network
// decoration cluster.
const WORDMARK_WIDTH = 580
const WORDMARK_ASPECT = 1121 / 161
const WORDMARK_HEIGHT = WORDMARK_WIDTH / WORDMARK_ASPECT
const WORDMARK_X = PADDING
const WORDMARK_Y = 220

function renderDefaultSvg(wordmarkDataUri) {
  // Single right-side cluster, same shape as topic OGs but seeded
  // distinctly so the brand image still has its own fingerprint.
  const network = networkDecor({
    seed: hashString('opensats-default'),
  })

  const taglineY = WORDMARK_Y + WORDMARK_HEIGHT + 64
  const taglineLine2Y = taglineY + 46
  const urlY = 568
  const separatorY = urlY - 36

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${
    COLORS.background
  }" />
      ${network}

      <image href="${wordmarkDataUri}" x="${WORDMARK_X}" y="${WORDMARK_Y}" width="${WORDMARK_WIDTH}" height="${WORDMARK_HEIGHT}" />

      <text x="${PADDING}" y="${taglineY}" fill="${
    COLORS.summary
  }" font-size="32" font-family="${INTER_FONT_FAMILY}" font-weight="500">
        ${escapeXml(TAGLINE)}
      </text>
      <text x="${PADDING}" y="${taglineLine2Y}" fill="${
    COLORS.summary
  }" font-size="32" font-family="${INTER_FONT_FAMILY}" font-weight="500">
        ${escapeXml(TAGLINE_LINE_2)}
      </text>

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${PADDING}" y="${urlY}" fill="${
    COLORS.url
  }" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">
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
