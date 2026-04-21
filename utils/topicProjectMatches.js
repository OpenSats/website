const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function readMdxFrontmatter(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.mdx')) continue
    const full = path.join(dir, file)
    const raw = fs.readFileSync(full, 'utf8')
    const { data } = matter(raw)
    out.push({
      slug: file.replace(/\.mdx$/, ''),
      title: data.title || '',
      aliases: Array.isArray(data.aliases) ? data.aliases : [],
      draft: !!data.draft,
    })
  }
  return out
}

function computeTopicProjectMatches(root) {
  const topics = readMdxFrontmatter(path.join(root, 'data', 'topics'))
  const projects = readMdxFrontmatter(path.join(root, 'data', 'projects'))

  const matches = []
  for (const t of topics) {
    if (t.draft) continue
    const keys = new Set(
      [t.title, t.slug, ...t.aliases].map(normalize).filter(Boolean)
    )
    const project = projects.find(
      (p) => keys.has(normalize(p.slug)) || keys.has(normalize(p.title))
    )
    if (project) {
      matches.push({
        topicSlug: t.slug,
        projectSlug: project.slug,
        projectTitle: project.title,
      })
    }
  }
  return matches
}

module.exports = { computeTopicProjectMatches, normalize }
