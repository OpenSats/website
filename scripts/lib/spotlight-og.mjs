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
  {
    file: 'daniela-brozzoni/hero.jpg',
    crop: '870 40 560 560',
    width: 1774,
    height: 887,
  },
  {
    file: 'kurt-unger/hero.jpg',
    crop: '1170 0 650 650',
    width: 1916,
    height: 821,
  },
  {
    file: 'bruno-garcia/hero.png',
    crop: '1370 40 520 520',
    width: 1916,
    height: 821,
  },
  {
    file: 'barry-deen/featured.jpg',
    crop: '610 110 590 411',
    width: 1200,
    height: 675,
  },
]

// A shallow wave gives the strip a physical curve without warping faces.
const waveY = (x) => 300 + 24 * Math.sin(((x - 120) * Math.PI * 2) / 1400)
const waveAngle = (x) =>
  (Math.atan(
    ((24 * Math.PI * 2) / 1400) * Math.cos(((x - 120) * Math.PI * 2) / 1400)
  ) *
    180) /
  Math.PI

export async function renderSpotlightSvg() {
  const wordmark = await loadWordmarkDataUri()
  const portraits = await Promise.all(
    PORTRAITS.map(async ({ file, crop, width, height }, index) => {
      const image = await publicAssetToDataUri(
        `/static/images/spotlight/${file}`
      )
      if (!image) throw new Error(`Missing spotlight portrait: ${file}`)
      const centerX = 150 + index * 300
      const centerY = waveY(centerX) + 130
      return `<g transform="rotate(${waveAngle(
        centerX
      )} ${centerX} ${centerY})">
        <svg x="${centerX - 132}" y="${
        centerY - 92
      }" width="264" height="184" viewBox="${crop}" preserveAspectRatio="xMidYMid slice" overflow="hidden">
          <image href="${image}" width="${width}" height="${height}" />
        </svg>
      </g>`
    })
  )
  const xs = Array.from({ length: 129 }, (_, index) => -40 + index * 10)
  const ribbon = [
    ...xs.map((x) => `${x},${waveY(x)}`),
    ...xs
      .slice()
      .reverse()
      .map((x) => `${x},${waveY(x) + 260}`),
  ].join(' ')
  const perforations = Array.from({ length: 37 }, (_, index) => {
    const x = -30 + index * 35
    return [15, 235]
      .map((offset) => {
        const y = waveY(x) + offset
        return `<rect x="${x}" y="${y}" width="14" height="10" rx="2" fill="${
          COLORS.background
        }" transform="rotate(${waveAngle(x)} ${x + 7} ${y + 5})" />`
      })
      .join('')
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
    <defs>
      <linearGradient id="film-fade" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="white" stop-opacity="0" />
        <stop offset="0.14" stop-color="white" />
        <stop offset="0.86" stop-color="white" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </linearGradient>
      <mask id="film-mask"><rect width="1200" height="630" fill="url(#film-fade)" /></mask>
    </defs>
    <rect width="1200" height="630" fill="${COLORS.background}" />
    <image href="${wordmark}" x="64" y="44" width="220" height="32" />
    <text x="60" y="168" font-family="${INTER_FONT_FAMILY}" font-size="76" font-weight="800" letter-spacing="-2" fill="${
    COLORS.title
  }">Spotlights</text>
    <text x="64" y="218" font-family="${INTER_FONT_FAMILY}" font-size="26" fill="${
    COLORS.summary
  }">The people behind the open-source work.</text>
    <g mask="url(#film-mask)">
      <polygon points="${ribbon}" fill="#242321" />
      ${perforations}
      ${portraits.join('')}
    </g>
  </svg>`
}
