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
      const x = 600 + (index % 2) * 280
      const y = 56 + Math.floor(index / 2) * 264
      return `<svg x="${x}" y="${y}" width="264" height="248" viewBox="${crop}" preserveAspectRatio="xMidYMid slice" overflow="hidden">
        <image href="${image}" width="${
        file.startsWith('daniela') ? 1774 : 1916
      }" height="${file.startsWith('daniela') ? 887 : 821}" />
      </svg>`
    })
  )
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
    <rect width="1200" height="630" fill="${COLORS.background}" />
    <image href="${wordmark}" x="64" y="64" width="220" height="32" />
    <rect x="64" y="208" width="56" height="5" fill="${COLORS.accent}" />
    <text x="60" y="286" font-family="${INTER_FONT_FAMILY}" font-size="64" font-weight="800" letter-spacing="-2" fill="${
    COLORS.title
  }">OpenSats</text>
    <text x="60" y="360" font-family="${INTER_FONT_FAMILY}" font-size="64" font-weight="800" letter-spacing="-2" fill="${
    COLORS.title
  }">Spotlights</text>
    <text x="64" y="420" font-family="${INTER_FONT_FAMILY}" font-size="25" fill="${
    COLORS.summary
  }">The people behind</text>
    <text x="64" y="456" font-family="${INTER_FONT_FAMILY}" font-size="25" fill="${
    COLORS.summary
  }">the open-source work.</text>
    <text x="64" y="566" font-family="${INTER_FONT_FAMILY}" font-size="20" fill="${
    COLORS.summary
  }">opensats.org/spotlight</text>
    ${portraits.join('')}
  </svg>`
}
