const REPO_SUFFIX_BY_MAIN_FOCUS: Record<string, string> = {
  core: '-core',
  ecash: '-ecash',
  layer1: '-layer1',
  layer2: '-layer2',
  nostr: '-nostr',
}

export function normalizeMainFocus(mainFocus: unknown) {
  return mainFocus ? `${mainFocus}`.toLowerCase() : ''
}

export function getApplicationRepo(baseRepo: string, mainFocus: unknown) {
  return `${baseRepo}${
    REPO_SUFFIX_BY_MAIN_FOCUS[normalizeMainFocus(mainFocus)] || ''
  }`
}

export function getApplicationIssueLabels(body: Record<string, unknown>) {
  const mainFocus = normalizeMainFocus(body.main_focus)
  const issueLabels = mainFocus ? [mainFocus] : []

  if (mainFocus === 'layer1' || mainFocus === 'layer2') {
    issueLabels.push('bitcoin')
  }

  if (body.source === 'common-grant-app') {
    issueLabels.push('common-grant-app')
  }

  if (body.LTS) issueLabels.push('LTS')
  if (body.RED) issueLabels.push('RED')
  if (body.has_received_funding === 'yes') issueLabels.push('prior funding')

  if (!body.RED) {
    if (!body.free_open_source) issueLabels.push('not FLOSS')
    if (!body.are_you_lead) issueLabels.push('surrogate')
  }

  return issueLabels
}
