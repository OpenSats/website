import { readFileSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

// Render at 4× the SVG dimensions. Install Verdana to match the SVG lettering.
for (const theme of ['light', 'dark']) {
  const base = new URL(
    `../public/static/images/badges/human-slop-${theme}`,
    import.meta.url
  )
  const svg = readFileSync(`${base.pathname}.svg`, 'utf8')
  const renderer = new Resvg(svg, { fitTo: { mode: 'width', value: 560 } })
  writeFileSync(`${base.pathname}.png`, renderer.render().asPng())
}
