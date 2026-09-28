import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { blogOgImagePath, isLocalImage } from '../utils/blogOgImages.ts'
import { ROOT, OG_WIDTH, OG_HEIGHT } from './lib/og-network.mjs'

// Run after all generators; reject oversized or incorrectly sized social cards.
const root = path.join(ROOT, 'public/static/images')
const maxBytes = 1_000_000

async function check(file) {
  const [{ width, height }, { size }] = await Promise.all([
    sharp(file).metadata(),
    fs.stat(file),
  ])
  if (width !== OG_WIDTH || height !== OG_HEIGHT || size >= maxBytes) {
    throw new Error(
      `${path.relative(
        ROOT,
        file
      )}: ${width}×${height}, ${size} bytes; expected ${OG_WIDTH}×${OG_HEIGHT} and < ${maxBytes} bytes`
    )
  }
}

async function main() {
  const files = new Set(['og-default.png', 'heartbeat/og.png'])
  const posts = JSON.parse(
    await fs.readFile(
      path.join(ROOT, '.contentlayer/generated/Blog/_index.json'),
      'utf8'
    )
  )
  // Check expected URLs too: enumerating the output alone misses absent cards.
  for (const post of posts) {
    for (const [index, image] of (post.images || []).entries()) {
      if (isLocalImage(image))
        files.add(
          path.relative(
            root,
            path.join(ROOT, 'public', blogOgImagePath(post.slug, index))
          )
        )
    }
  }
  for (const group of [
    'blog',
    'projects',
    'funds',
    'newsletter',
    'topics',
    'pages',
    'authors',
  ]) {
    const dir = path.join(root, group, 'og')
    for (const entry of await fs.readdir(dir, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (entry.isFile())
        files.add(path.relative(root, path.join(entry.parentPath, entry.name)))
    }
  }
  for (const file of files) await check(path.join(root, file))
  console.log(`Verified ${files.size} OG images: all 1200×630 and under 1 MB.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
