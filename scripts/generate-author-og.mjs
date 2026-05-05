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

// Per-author share cards for /about/<slug>. Same light topic-OG family
// (light bg, Inter type, faint network decoration) but with a circular
// avatar on the right replacing the dense network cluster, so the
// person, not the abstract pattern, is the focal point.
const outputDir = path.join(
  ROOT,
  'public',
  'static',
  'images',
  'authors',
  'og'
)

// Authors who don't get a custom OG card and fall back to the default
// brand image. Keep this list in sync with AUTHORS_WITHOUT_OG in
// components/SEO.tsx.
const SKIP_SLUGS = new Set([
  'bayer',
  'cfunk',
  'dtonon',
  'ecurrencyhodler',
  'jason',
  'julian',
  'lorenzo',
  'niftynei',
])

const AVATAR_SIZE = 320
const AVATAR_CX = OG_WIDTH - PADDING - AVATAR_SIZE / 2
const AVATAR_CY = OG_HEIGHT / 2 - 28
const AVATAR_X = AVATAR_CX - AVATAR_SIZE / 2
const AVATAR_Y = AVATAR_CY - AVATAR_SIZE / 2

let faviconDataUri = ''

function rolePartsFor(author) {
  const parts = []
  if (author.occupation) parts.push(author.occupation)
  if (author.company && author.company !== author.occupation) {
    parts.push(author.company)
  }
  return parts
}

function renderAuthorSvg(author, avatarDataUri) {
  const titleLines = wrapText(author.name, 14, 2)
  const role = rolePartsFor(author).join(', ')
  const handle = author.nym ? `@${author.nym}` : ''
  // The "default" author is the OpenSats umbrella page rendered at
  // /about (not /about/default), so its OG URL row reflects that.
  const authorUrl =
    author.slug === 'default'
      ? 'opensats.org/about'
      : `opensats.org/about/${author.slug}`
  const seed = hashString(`author:${author.slug}`)

  const logoSize = 80
  const logoX = PADDING
  const logoY = PADDING + 8
  const logoBottom = logoY + logoSize

  const titleFontSize = titleLines.length > 1 ? 76 : 92
  const titleLineHeight = titleLines.length > 1 ? 86 : 100
  const titleStartY = logoBottom + (titleLines.length > 1 ? 88 : 108)

  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${
          index === 0 ? 0 : titleLineHeight
        }">${escapeXml(line)}</tspan>`
    )
    .join('')

  const titleBottomY = titleStartY + (titleLines.length - 1) * titleLineHeight
  const roleY = titleBottomY + 56
  const handleY = roleY + (role ? 46 : 0)
  const urlY = 568
  const separatorY = urlY - 36

  // Network decoration is pushed off behind the avatar so it doesn't
  // crowd the text. The avatar then sits on top via a clipped <image>.
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

  const avatarSvg = avatarDataUri
    ? `<defs>
         <clipPath id="avatar-clip">
           <circle cx="${AVATAR_CX}" cy="${AVATAR_CY}" r="${AVATAR_SIZE / 2}" />
         </clipPath>
       </defs>
       <circle cx="${AVATAR_CX}" cy="${AVATAR_CY}" r="${
        AVATAR_SIZE / 2 + 6
      }" fill="${COLORS.background}" />
       <image href="${avatarDataUri}" x="${AVATAR_X}" y="${AVATAR_Y}" width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip)" />
       <circle cx="${AVATAR_CX}" cy="${AVATAR_CY}" r="${
        AVATAR_SIZE / 2
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

      ${
        role
          ? `<text x="${PADDING}" y="${roleY}" fill="${
              COLORS.summary
            }" font-size="30" font-family="${INTER_FONT_FAMILY}">${escapeXml(
              role
            )}</text>`
          : ''
      }

      ${
        handle
          ? `<text x="${PADDING}" y="${handleY}" fill="${
              COLORS.url
            }" font-size="26" font-family="${INTER_FONT_FAMILY}" letter-spacing="0.5">${escapeXml(
              handle
            )}</text>`
          : ''
      }

      ${avatarSvg}

      <rect x="${PADDING}" y="${separatorY}" width="${CONTENT_WIDTH}" height="1" fill="${
    COLORS.separator
  }" />
      <text x="${PADDING}" y="${urlY}" fill="${
    COLORS.url
  }" font-size="22" font-family="${INTER_FONT_FAMILY}" letter-spacing="1">${escapeXml(
    authorUrl
  )}</text>
    </svg>
  `
}

async function writeAuthorImage(author) {
  const avatarDataUri = await publicAssetToDataUri(author.avatar)
  if (!avatarDataUri && author.avatar) {
    console.warn(`Missing avatar for ${author.slug}: ${author.avatar}`)
  }
  const svg = renderAuthorSvg(author, avatarDataUri)
  await writePng(path.join(outputDir, `${author.slug}.png`), renderSvgToPng(svg))
}

async function main() {
  await ensureCleanDir(outputDir)
  faviconDataUri = await loadFaviconDataUri()

  const authors = await loadContentlayerIndex('Authors')

  let written = 0
  for (const author of authors) {
    if (SKIP_SLUGS.has(author.slug)) continue
    await writeAuthorImage(author)
    written += 1
  }

  console.log(
    `Generated ${written} author OG images (skipped ${
      authors.length - written
    } author${authors.length - written === 1 ? '' : 's'}).`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
