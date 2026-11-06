import { slug } from 'github-slugger'

export function tagLink(tag: string) {
  const name = slug(tag)
  return name === 'spotlight' ? '/spotlight' : `/tags/${name}`
}
