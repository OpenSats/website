/**
 * Normalizes a topic term for comparison: lowercased, alphanumerics only.
 * Used to treat spelling variants as equivalent
 * (e.g. "AssumeUTXO" / "assume UTXO", "BOLT 12" / "BOLT12").
 */
export function normalizeTerm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Returns the aliases that should be shown to readers, dropping any alias
 * that is just a spelling variant of the title (or of another alias we've
 * already kept). The raw `topic.aliases` list is still the source of truth
 * for matching (blog-post relatedness, project linking, etc.); this helper
 * is purely for display.
 */
export function getDisplayAliases(topic: {
  title: string
  aliases?: string[] | null
}): string[] {
  const seen = new Set<string>([normalizeTerm(topic.title)])
  const result: string[] = []
  for (const alias of topic.aliases ?? []) {
    const key = normalizeTerm(alias)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(alias)
  }
  return result
}
