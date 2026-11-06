import {
  OG_WIDTH,
  OG_HEIGHT,
  COLORS,
  INTER_FONT_FAMILY,
  loadWordmarkDataUri,
  publicAssetToDataUri,
} from './og-network.mjs'

// Deliberate portrait crops from published spotlight artwork. Keep the
// selection stable across builds and review each crop when changing photos.
const PORTRAITS = [
  { file: 'daniela-brozzoni/hero.jpg', crop: '870 40 560 560' },
  { file: 'kurt-unger/hero.jpg', crop: '1170 0 650 650' },
  { file: 'bruno-garcia/hero.png', crop: '1370 40 520 520' },
  { file: 'barry-deen/hero.jpg', crop: '1400 100 380 380' },
]

export async function renderSpotlightSvg() {
  const wordmark = await loadWordmarkDataUri()
  const portraits = await Promise.all(
    PORTRAITS.map(async ({ file, crop }, index) => {
      const image = await publicAssetToDataUri(
        `/static/images/spotlight/${file}`
      )
      if (!image) throw new Error(`Missing spotlight portrait: ${file}`)
      const x = 90 + index * 262
      const y = 322
      return `<svg x="${x}" y="${y}" width="234" height="184" viewBox="${crop}" preserveAspectRatio="xMidYMid slice" overflow="hidden">
        <image href="${image}" width="${
        file.startsWith('daniela') ? 1774 : 1916
      }" height="${file.startsWith('daniela') ? 887 : 821}" />
      </svg>`
    })
  )
  // Perforations suggest a photographic contact strip without distressing
  // the portraits or adding artificial grain to the source photographs.
  const perforations = Array.from({ length: 30 }, (_, index) => {
    const x = 82 + index * 35
    return [294, 522]
      .map(
        (y) =>
          `<rect x="${x}" y="${y}" width="14" height="10" rx="2" fill="${COLORS.background}" />`
      )
      .join('')
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
    <rect width="1200" height="630" fill="${COLORS.background}" />
    <image href="${wordmark}" x="64" y="48" width="220" height="32" />
    <text x="60" y="174" font-family="${INTER_FONT_FAMILY}" font-size="68" font-weight="800" letter-spacing="-2" fill="${
    COLORS.title
  }">OpenSats Spotlights</text>
    <text x="64" y="224" font-family="${INTER_FONT_FAMILY}" font-size="26" fill="${
    COLORS.summary
  }">The people behind the open-source work.</text>
    <rect x="64" y="282" width="1072" height="262" rx="3" fill="#242321" />
    ${perforations}
    ${portraits.join('')}
    <rect x="64" y="582" width="32" height="3" fill="${COLORS.accent}" />
    <text x="110" y="590" font-family="${INTER_FONT_FAMILY}" font-size="20" fill="${
    COLORS.summary
  }">opensats.org/spotlight</text>
  </svg>`
}
