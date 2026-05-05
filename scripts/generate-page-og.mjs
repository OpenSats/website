import path from 'node:path'
import {
  ROOT,
  OG_WIDTH,
  OG_HEIGHT,
  PADDING,
  CONTENT_WIDTH,
  COLORS,
  INTER_FONT_FAMILY,
  backgroundDecor,
  ensureCleanDir,
  escapeXml,
  hashString,
  loadContentlayerIndex,
  loadFaviconDataUri,
  renderSvgToPng,
  wrapText,
  writePng,
} from './lib/og-network.mjs'

// Generates per-slug OG images for static MDX-driven pages
// (data/pages/*.mdx). Visually it's the topic OG template — same light
// surface, network decoration, Inter type — so every standalone page
// gets a coherent, on-brand share card without falling back to the
// generic default.
const outputDir = path.join(ROOT, 'public', 'static', 'images', 'pages', 'og')

// Most page slugs collide 1:1 with their URL path. The exceptions all
// live under /faq or /reports and get a manual override here. Any new
// MDX page that follows the slug == url-path convention "just works".
const SLUG_TO_URL_PATH = {
  'faq-application': 'faq/application',
  'faq-grantees': 'faq/grantee',
  'report-success': 'reports/success',
}

// Utility / legal / form-result pages that don't benefit from a custom
// social card and look better falling back to the default brand OG.
// Keep this list in sync with PAGES_WITHOUT_OG in components/SEO.tsx.
const SKIP_SLUGS = new Set([
  'canary',
  'pgp',
  'privacy',
  'report-success',
  'submitted',
  'terms',
  'thankyou',
])

let faviconDataUri = ''

function urlPathForSlug(slug) {
  return SLUG_TO_URL_PATH[slug] ?? slug
}

function renderPageSvg(page) {
  const titleLines = wrapText(page.title, 22, 2)
  const summaryText = page.summary || ''
  const pageUrl = `opensats.org/${urlPathForSlug(page.slug)}`
  const seed = hashString(`page:${page.slug}`)

  const logoSize = 88
  const logoX = PADDING
  const logoY = PADDING + 8
  const logoBottom = logoY + logoSize

  const titleFontSize = titleLines.length > 1 ? 80 : 96
  const titleLineHeight = titleLines.length > 1 ? 92 : 108
  const titleStartY = logoBottom + (titleLines.length > 1 ? 96 : 112)

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${
          index === 0 ? 0 : titleLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  const titleBottomY = titleStartY + (titleLines.length - 1) * titleLineHeight
  const summaryStartY = titleBottomY + 56
  const summaryLineHeight = 42
  const urlY = 568
  const separatorY = urlY - 36
  const summaryAvailable = separatorY - summaryStartY - 24
  const maxSummaryLines = Math.max(
    0,
    Math.floor(summaryAvailable / summaryLineHeight)
  )
  const summaryLines =
    maxSummaryLines > 0 && summaryText
      ? wrapText(summaryText, 52, maxSummaryLines)
      : []

  const summarySvg = summaryLines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${
          index === 0 ? 0 : summaryLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDecor(seed)}

      <image href="${faviconDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />

      <text x="${PADDING}" y="${titleStartY}" fill="${
    COLORS.title
  }" font-size="${titleFontSize}" font-weight="900" font-family="${INTER_FONT_FAMILY}" letter-spacing="-3">
        ${titleSvg}
      </text>

      ${
        summaryLines.length > 0
          ? `<text x="${PADDING}" y="${summaryStartY}" fill="${COLORS.summary}" font-size="30" font-family="${INTER_FONT_FAMILY}">
              ${summarySvg}
            </text>`
          : ''
      }

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${PADDING}" y="${urlY}" fill="${
    COLORS.url
  }" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">${escapeXml(
    pageUrl
  )}</text>
    </svg>
  `
}

async function writeImage(slug, svg) {
  await writePng(path.join(outputDir, `${slug}.png`), renderSvgToPng(svg))
}

async function main() {
  await ensureCleanDir(outputDir)
  faviconDataUri = await loadFaviconDataUri()

  const pages = await loadContentlayerIndex('Pages')

  let written = 0
  for (const page of pages) {
    if (SKIP_SLUGS.has(page.slug)) continue
    await writeImage(page.slug, renderPageSvg(page))
    written += 1
  }

  console.log(
    `Generated ${written} page OG images (skipped ${
      pages.length - written
    } utility page${pages.length - written === 1 ? '' : 's'}).`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
