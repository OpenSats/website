import path from 'node:path'
import {
  ROOT,
  OG_WIDTH,
  OG_HEIGHT,
  PADDING,
  COLORS,
  INTER_FONT_FAMILY,
  escapeXml,
  loadWordmarkDataUri,
  publicAssetToDataUri,
  renderSvgToPng,
  writePng,
} from './lib/og-network.mjs'

// Single static brand image used as the og:image / twitter:image fallback
// for everything that doesn't have a per-slug OG. Different from the
// topic-style template on purpose: the brand fallback leads with the
// orange logomark + the mission statement so it works as a stand-alone
// "what is this site" card on social cards and link previews.
const outputPath = path.join(
  ROOT,
  'public',
  'static',
  'images',
  'og-default.png'
)

// Headline is split into segments per line so we can color a single
// word ("FOSS") in the brand orange without breaking the rest of the
// line into separate <text> elements.
const HEADLINE_LINES = [
  [{ text: 'Sustainable funding' }],
  [
    { text: 'for ' },
    { text: 'FOSS', color: COLORS.accent },
    { text: ' developers' },
  ],
  [{ text: 'in the bitcoin space.' }],
]

// Small wordmark in the header slot so the brand reads first without
// competing with the headline below it.
const WORDMARK_WIDTH = 220
const WORDMARK_ASPECT = 1121 / 161
const WORDMARK_HEIGHT = WORDMARK_WIDTH / WORDMARK_ASPECT

// Logomark is a square. Sized so it visually balances the three-line
// headline on the left and stays inside the safe area on the right.
const LOGO_SIZE = 320

function renderDefaultSvg(wordmarkDataUri, logoDataUri) {
  const headlineFontSize = 64
  const headlineLineHeight = 78

  // Bottom-anchor the headline and logomark on the same baseline so
  // the wordmark gets full breathing room at the top and the main
  // content sits as a unified block at the bottom of the canvas.
  // BOTTOM_Y mirrors the wordmark's top inset (~64px) for a balanced
  // top/bottom margin.
  const BOTTOM_Y = OG_HEIGHT - 64

  const headlineX = PADDING
  const headlineDescender = Math.round(headlineFontSize * 0.18)
  const headlineLastBaselineY = BOTTOM_Y - headlineDescender
  const headlineStartY =
    headlineLastBaselineY - (HEADLINE_LINES.length - 1) * headlineLineHeight

  const wordmarkX = PADDING
  const wordmarkY = 64

  const headlineSvg = HEADLINE_LINES.map((segments, lineIndex) => {
    const inner = segments
      .map((segment) =>
        segment.color
          ? `<tspan fill="${segment.color}">${escapeXml(segment.text)}</tspan>`
          : escapeXml(segment.text)
      )
      .join('')
    return `<tspan x="${headlineX}" dy="${
      lineIndex === 0 ? 0 : headlineLineHeight
    }">${inner}</tspan>`
  }).join('')

  const logoX = OG_WIDTH - PADDING - LOGO_SIZE
  const logoY = BOTTOM_Y - LOGO_SIZE

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${
    COLORS.background
  }" />

      <image href="${wordmarkDataUri}" x="${wordmarkX}" y="${wordmarkY}" width="${WORDMARK_WIDTH}" height="${WORDMARK_HEIGHT}" />

      <text x="${headlineX}" y="${headlineStartY}" fill="${
    COLORS.title
  }" font-size="${headlineFontSize}" font-weight="800" font-family="${INTER_FONT_FAMILY}" letter-spacing="-2">
        ${headlineSvg}
      </text>

      <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${LOGO_SIZE}" height="${LOGO_SIZE}" />
    </svg>
  `
}

async function main() {
  const [wordmarkDataUri, logoDataUri] = await Promise.all([
    loadWordmarkDataUri(),
    publicAssetToDataUri('/img/project/opensats_logo.png'),
  ])

  if (!logoDataUri) {
    throw new Error(
      'Missing logomark at public/img/project/opensats_logo.png; cannot render default OG.'
    )
  }

  const svg = renderDefaultSvg(wordmarkDataUri, logoDataUri)
  await writePng(outputPath, renderSvgToPng(svg))
  console.log('Generated default OG image at', path.relative(ROOT, outputPath))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
