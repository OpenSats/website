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

const outputDir = path.join(ROOT, 'public', 'static', 'images', 'topics', 'og')

let faviconDataUri = ''

function renderTopicSvg(topic) {
  const titleLines = wrapText(topic.title, 22, 2, `topic ${topic.slug} title`)
  const summaryText = topic.ogSummary || topic.summary
  const topicUrl = `opensats.org/topics/${topic.slug}`
  const seed = hashString(topic.slug)

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
      ? wrapText(summaryText, 52, maxSummaryLines, `topic ${topic.slug} summary`)
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
    topicUrl
  )}</text>
    </svg>
  `
}

function renderIndexSvg() {
  const logoSize = 88
  const logoX = PADDING
  const logoY = PADDING + 8
  const seed = hashString('topics-index')

  return `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDecor(seed)}

      <image href="${faviconDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" />

      <text x="${PADDING}" y="320" fill="${
    COLORS.title
  }" font-size="120" font-weight="900" font-family="${INTER_FONT_FAMILY}" letter-spacing="-4">
        Topics
      </text>

      <text x="${PADDING}" y="384" fill="${
    COLORS.summary
  }" font-size="30" font-family="${INTER_FONT_FAMILY}">
        Short definitions for technical terms
      </text>
      <text x="${PADDING}" y="426" fill="${
    COLORS.summary
  }" font-size="30" font-family="${INTER_FONT_FAMILY}">
        that show up in our blog posts.
      </text>

      <rect x="${PADDING}" y="532" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${PADDING}" y="568" fill="${
    COLORS.url
  }" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">
        opensats.org/topics
      </text>
    </svg>
  `
}

async function writeImage(filename, svg) {
  await writePng(path.join(outputDir, filename), renderSvgToPng(svg))
}

async function main() {
  await ensureCleanDir(outputDir)
  faviconDataUri = await loadFaviconDataUri()

  const topics = await loadContentlayerIndex('Topic')

  await writeImage('index.png', renderIndexSvg())

  for (const topic of topics) {
    await writeImage(`${topic.slug}.png`, renderTopicSvg(topic))
  }

  console.log(
    `Generated topic OG images: index + ${topics.length} topic${
      topics.length === 1 ? '' : 's'
    }.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
