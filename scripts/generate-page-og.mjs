import path from 'node:path'
import {
  formatLifetimeStatDisplay,
  formatMapOgSentenceSegments,
  resolveLifetimeStats,
} from '../utils/lifetimeStats.ts'
import {
  renderGranteeMapDataUri,
  WORLD_MAP_ASPECT,
} from './lib/grantee-map.mjs'
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
  measureTextBBoxWithResvg,
  measureTextWidthWithResvg,
  networkDecor,
  renderSvgToPng,
  wrapText,
  writePng,
} from './lib/og-network.mjs'

// Generates per-slug OG images for MDX-driven pages (data/pages/*.mdx) and a
// small set of TSX-only routes. Visually it's the topic OG template — same
// light surface, network decoration, Inter type — except transparency, which
// foregrounds the three lifetime stats shown on the live page.
const outputDir = path.join(ROOT, 'public', 'static', 'images', 'pages', 'og')

// Most page slugs collide 1:1 with their URL path. The exceptions all
// live under /faq or /reports and get a manual override here. Any new
// MDX page that follows the slug == url-path convention "just works".
const SLUG_TO_URL_PATH = {
  'faq-application': 'faq/application',
  'faq-grantees': 'faq/grantee',
  'report-success': 'reports/success',
}

// TSX-only routes that are not backed by data/pages/*.mdx.
const EXTRA_PAGES = [
  {
    slug: 'map',
    title: 'Map',
    summary: 'Countries where OpenSats has awarded grants.',
  },
]

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
  const titleLines = wrapText(page.title, 22, 2, `page ${page.slug} title`)
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
      ? wrapText(summaryText, 52, maxSummaryLines, `page ${page.slug} summary`)
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

function renderTransparencySvg(stats) {
  const pageUrl = 'opensats.org/transparency'
  const seed = hashString('page:transparency')

  const logoSize = 72
  const logoX = PADDING
  const logoY = PADDING + 8
  const titleX = logoX + logoSize + 24
  const titleY = logoY + logoSize / 2 + 18

  const colWidth = CONTENT_WIDTH / 3
  const numberY = 360
  const labelY = 430
  const urlY = 568
  const separatorY = urlY - 36

  const statColumns = stats
    .map((stat, index) => {
      const centerX = PADDING + colWidth * index + colWidth / 2
      const value = formatLifetimeStatDisplay(index, stat.value)
      return `
        <text x="${centerX}" y="${numberY}" fill="${COLORS.accent}" font-size="56" font-weight="700" font-family="${INTER_FONT_FAMILY}" text-anchor="middle">${escapeXml(value)}</text>
        <text x="${centerX}" y="${labelY}" fill="${COLORS.summary}" font-size="26" font-family="${INTER_FONT_FAMILY}" text-anchor="middle">${escapeXml(stat.label)}</text>
      `
    })
    .join('')

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDecor(seed)}

      <image href="${faviconDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />

      <text x="${titleX}" y="${titleY}" fill="${COLORS.title}" font-size="56" font-weight="900" font-family="${INTER_FONT_FAMILY}" letter-spacing="-2">Transparency</text>

      ${statColumns}

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${COLORS.separator}" />
      <text x="${PADDING}" y="${urlY}" fill="${COLORS.url}" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">${escapeXml(pageUrl)}</text>
    </svg>
  `
}

// Tailwind primary-100 — matches StatsSentence highlight pills on light bg.
const HIGHLIGHT_BG = '#ffedd5'

function measureText(text, fontSize) {
  let width = 0
  for (const char of text) {
    if (char === ' ') {
      width += fontSize * 0.34
    } else if (/[0-9~$+]/.test(char)) {
      width += fontSize * 0.58
    } else {
      width += fontSize * 0.52
    }
  }
  return width
}

function buildRenderTokens(segments) {
  const tokens = []

  for (const segment of segments) {
    if (segment.highlight) {
      tokens.push({ kind: 'highlight', text: segment.text, atomic: true })
      continue
    }

    if (/^\s+(to|in)\s+$/.test(segment.text)) {
      tokens.push({ kind: 'plain', text: segment.text, atomic: true })
      continue
    }

    for (const part of segment.text.split(/(\s+)/)) {
      if (part) {
        tokens.push({ kind: 'plain', text: part })
      }
    }
  }

  return tokens
}

function lineToRuns(line) {
  const runs = []
  let plain = ''

  for (const token of line) {
    if (token.kind === 'plain' && !token.atomic) {
      plain += token.text
      continue
    }

    if (plain) {
      runs.push({ kind: 'plain', text: plain })
      plain = ''
    }

    runs.push(token)
  }

  if (plain) {
    runs.push({ kind: 'plain', text: plain })
  }

  return runs
}

// Even padding inside the pill on both sides; a small gap separates the pill
// from the following plain text so the two never touch.
const HIGHLIGHT_PAD = 14
const AFTER_HIGHLIGHT_GAP = 8

function advanceWidth(text, fontSize) {
  const { x, width } = measureTextBBoxWithResvg(text, fontSize)
  return x + width
}

function tokenWidth(token, fontSize) {
  if (token.kind === 'highlight') {
    return advanceWidth(token.text, fontSize) + HIGHLIGHT_PAD * 2 + AFTER_HIGHLIGHT_GAP
  }
  if (token.atomic) {
    return measureTextWidthWithResvg(token.text, fontSize)
  }
  return measureText(token.text, fontSize)
}

function layoutHighlightedSentence(segments, options) {
  const {
    x,
    y,
    maxWidth,
    fontSize,
    lineHeight,
    textColor,
    highlightBg = HIGHLIGHT_BG,
    padY = 8,
  } = options

  const tokens = buildRenderTokens(segments)
  const lines = []
  let currentLine = []
  let currentWidth = 0

  for (const token of tokens) {
    const width = tokenWidth(token, fontSize)
    const isSpace = token.kind === 'plain' && /^\s+$/.test(token.text)

    if (
      currentLine.length &&
      !isSpace &&
      currentWidth + width > maxWidth
    ) {
      lines.push(currentLine)
      currentLine = []
      currentWidth = 0
    }

    if (
      token.atomic &&
      currentWidth + width > maxWidth &&
      currentLine.length
    ) {
      lines.push(currentLine)
      currentLine = []
      currentWidth = 0
    }

    currentLine.push(token)
    currentWidth += width
  }

  if (currentLine.length) {
    lines.push(currentLine)
  }

  let svg = ''
  let lineY = y

  for (const line of lines) {
    let trimmed = line
    while (
      trimmed.length &&
      trimmed[0].kind === 'plain' &&
      /^\s+$/.test(trimmed[0].text)
    ) {
      trimmed = trimmed.slice(1)
    }

    let xCursor = x

    for (const run of lineToRuns(trimmed)) {
      if (run.kind === 'highlight') {
        const { x: inkX, width: inkWidth } = measureTextBBoxWithResvg(
          run.text,
          fontSize
        )
        // Anchor the pill on the actual ink so left/right padding is equal,
        // independent of the glyph's left side bearing.
        const inkLeft = xCursor + inkX
        const rectX = inkLeft - HIGHLIGHT_PAD
        const rectWidth = inkWidth + HIGHLIGHT_PAD * 2
        svg += `<rect x="${rectX}" y="${
          lineY - fontSize - padY + 8
        }" width="${rectWidth}" height="${
          fontSize + padY * 2
        }" rx="10" fill="${highlightBg}" />`
        svg += `<text x="${xCursor}" y="${lineY}" fill="${textColor}" font-size="${fontSize}" font-family="${INTER_FONT_FAMILY}">${escapeXml(
          run.text
        )}</text>`
        xCursor = rectX + rectWidth + AFTER_HIGHLIGHT_GAP
        continue
      }

      svg += `<text x="${xCursor}" y="${lineY}" fill="${textColor}" font-size="${fontSize}" font-family="${INTER_FONT_FAMILY}">${escapeXml(
        run.text
      )}</text>`
      xCursor +=
        run.kind === 'plain' && run.atomic
          ? measureTextWidthWithResvg(run.text, fontSize)
          : measureText(run.text, fontSize)
    }

    lineY += lineHeight
  }

  return svg
}

function renderMapSvg(mapDataUri, stats) {
  const pageUrl = 'opensats.org/map'
  const seed = hashString('page:map')

  const mapWidth = 560
  const mapHeight = mapWidth / WORLD_MAP_ASPECT
  const mapX = OG_WIDTH - PADDING - mapWidth
  const mapY = (OG_HEIGHT - mapHeight - 48) / 2 - 16

  const logoSize = 72
  const logoX = PADDING
  const logoY = PADDING + 8
  const sentenceX = PADDING
  const sentenceY = logoY + logoSize + 96
  const sentenceMaxWidth = mapX - PADDING - 24
  const urlY = 568
  const separatorY = urlY - 36

  const sentenceSvg = layoutHighlightedSentence(
    formatMapOgSentenceSegments(stats),
    {
      x: sentenceX,
      y: sentenceY,
      maxWidth: sentenceMaxWidth,
      fontSize: 38,
      lineHeight: 58,
      textColor: COLORS.summary,
    }
  )

  const networkSvg = networkDecor({
    seed,
    minX: mapX - 40,
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

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${COLORS.background}" />
      ${networkSvg}

      <image href="${faviconDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />

      ${sentenceSvg}

      <image href="${mapDataUri}" x="${mapX}" y="${mapY}" width="${mapWidth}" height="${mapHeight}" />

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${COLORS.separator}" />
      <text x="${PADDING}" y="${urlY}" fill="${COLORS.url}" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">${escapeXml(pageUrl)}</text>
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
  const transparencyStats = await resolveLifetimeStats()
  const mapDataUri = await renderGranteeMapDataUri(
    {
      base: '#e5e7eb',
      baseOpacity: 1,
      highlight: COLORS.accent,
      stroke: '#ffffff',
      strokeWidth: 0.5,
    },
    900
  )

  let written = 0
  for (const page of pages) {
    if (SKIP_SLUGS.has(page.slug)) continue

    if (page.slug === 'transparency') {
      await writeImage('transparency', renderTransparencySvg(transparencyStats))
    } else {
      await writeImage(page.slug, renderPageSvg(page))
    }

    written += 1
  }

  for (const page of EXTRA_PAGES) {
    if (page.slug === 'map') {
      await writeImage('map', renderMapSvg(mapDataUri, transparencyStats))
    } else {
      await writeImage(page.slug, renderPageSvg(page))
    }
    written += 1
  }

  const skipped = pages.filter((page) => SKIP_SLUGS.has(page.slug)).length

  console.log(
    `Generated ${written} page OG images (skipped ${skipped} utility page${skipped === 1 ? '' : 's'}, plus ${EXTRA_PAGES.length} TSX route${EXTRA_PAGES.length === 1 ? '' : 's'}).`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
