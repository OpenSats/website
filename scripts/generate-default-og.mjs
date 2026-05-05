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

const HEADLINE_LINES = [
  'Sustainable funding',
  'for FOSS developers',
  'in the bitcoin space.',
]
const CTA_LABEL = 'Donate \u2192'
const CTA_URL = 'opensats.org/donate'

// Small wordmark in the header slot so the brand reads first without
// competing with the headline below it.
const WORDMARK_WIDTH = 220
const WORDMARK_ASPECT = 1121 / 161
const WORDMARK_HEIGHT = WORDMARK_WIDTH / WORDMARK_ASPECT

// Logomark is a square. Sized so it visually balances the three-line
// headline on the left and stays inside the safe area on the right.
const LOGO_SIZE = 320

function renderDefaultSvg(wordmarkDataUri, logoDataUri) {
  const wordmarkX = PADDING
  const wordmarkY = 64

  const headlineX = PADDING
  const headlineFontSize = 64
  const headlineLineHeight = 78
  const headlineStartY = 230
  const headlineSvg = HEADLINE_LINES.map(
    (line, index) =>
      `<tspan x="${headlineX}" dy="${
        index === 0 ? 0 : headlineLineHeight
      }">${escapeXml(line)}</tspan>`
  ).join('')

  const logoX = OG_WIDTH - PADDING - LOGO_SIZE
  const logoY = (OG_HEIGHT - LOGO_SIZE) / 2 - 20

  const urlY = 568
  const separatorY = urlY - 36

  const ctaWidth = 200
  const ctaHeight = 56
  const ctaRadius = ctaHeight / 2
  const ctaX = OG_WIDTH - PADDING - ctaWidth
  const ctaY = urlY - ctaHeight + 14
  const ctaTextY = ctaY + ctaHeight / 2 + 9

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

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />

      <text x="${PADDING}" y="${urlY}" fill="${
    COLORS.url
  }" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">
        ${escapeXml(CTA_URL)}
      </text>

      <rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="${ctaRadius}" ry="${ctaRadius}" fill="${
    COLORS.accent
  }" />
      <text x="${
        ctaX + ctaWidth / 2
      }" y="${ctaTextY}" text-anchor="middle" fill="#ffffff" font-size="26" font-family="${INTER_FONT_FAMILY}" font-weight="700">
        ${escapeXml(CTA_LABEL)}
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
