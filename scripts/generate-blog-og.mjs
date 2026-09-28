import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { blogOgImagePath, isLocalImage } from '../utils/blogOgImages.ts'
import {
  ROOT,
  OG_WIDTH,
  OG_HEIGHT,
  COLORS,
  ensureCleanDir,
} from './lib/og-network.mjs'

// Reviewed individually: preserve headroom above these portraits when trimming
// the 16:9 source to 1200×630. Other cards retain their centered composition.
const cropPositions = {
  '/static/images/spotlight/barry-deen/featured.jpg': 'north',
  '/static/images/spotlight/daniela-brozzoni/featured.jpg': 'north',
  '/static/images/spotlight/kurt-unger/featured.jpg': 'north',
  // Keep the illustrated subjects clear of the right edge in these wide heroes.
  '/static/images/spotlight/cody-tseng/hero.jpg': 'east',
  '/static/images/spotlight/nym21/hero.jpg': 'east',
}

async function main() {
  const posts = JSON.parse(
    await fs.readFile(
      path.join(ROOT, '.contentlayer/generated/Blog/_index.json'),
      'utf8'
    )
  )
  await ensureCleanDir(path.join(ROOT, 'public/static/images/blog/og'))
  let count = 0
  for (const post of posts) {
    const images =
      typeof post.images === 'string' ? [post.images] : post.images || []
    for (const [index, image] of images.entries()) {
      if (!isLocalImage(image)) continue
      const output = path.join(
        ROOT,
        'public',
        blogOgImagePath(post.slug, index)
      )
      await fs.mkdir(path.dirname(output), { recursive: true })
      // Fill edge to edge; use the individually reviewed crop where supplied.
      await sharp(path.join(ROOT, 'public', image))
        .rotate()
        .resize(OG_WIDTH, OG_HEIGHT, {
          fit: 'cover',
          position: cropPositions[image] || 'centre',
          background: COLORS.background,
        })
        .flatten({ background: COLORS.background })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(output)
      count++
    }
  }
  console.log(`Generated ${count} blog OG images (1200×630 JPEG).`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
