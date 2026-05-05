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
// line into separate <text> elements. Four short lines let the type
// stay big while keeping every line clear of the logomark on the
// right.
const HEADLINE_LINES = [
  [{ text: 'Providing' }],
  [{ text: 'sustainable funding' }],
  [
    { text: 'for ' },
    { text: 'FOSS', color: COLORS.accent },
    { text: ' developers' },
  ],
  [{ text: 'in the bitcoin space.' }],
]

const FOOTER_LABEL = 'a 501(c)(3) public charity'

// Small wordmark in the header slot so the brand reads first without
// competing with the headline below it.
const WORDMARK_WIDTH = 220
const WORDMARK_ASPECT = 1121 / 161
const WORDMARK_HEIGHT = WORDMARK_WIDTH / WORDMARK_ASPECT

// Logomark is a square. Sized so it visually balances the three-line
// headline on the left and stays inside the safe area on the right.
const LOGO_SIZE = 320

function renderDefaultSvg(wordmarkDataUri, logoDataUri) {
  // Bigger headline now that the copy is split across four short lines
  // — every line clears the logomark on the right at this width.
  const headlineFontSize = 60
  const headlineLineHeight = 74

  const headlineX = PADDING

  // Center the four-line headline vertically on the canvas midpoint so
  // it sits naturally between the wordmark header and the footer line.
  const linesCount = HEADLINE_LINES.length
  const headlineCenterY = OG_HEIGHT / 2
  const headlineStartY =
    headlineCenterY -
    ((linesCount - 1) / 2) * headlineLineHeight +
    headlineFontSize / 3

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
  const logoY = (OG_HEIGHT - LOGO_SIZE) / 2

  const footerY = 580

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

      <text x="${PADDING}" y="${footerY}" fill="${
    COLORS.url
  }" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">
        ${escapeXml(FOOTER_LABEL)}
      </text>
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
