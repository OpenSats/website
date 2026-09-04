import { Octokit } from '@octokit/rest'

export interface GrantIssue {
  title: string
  body?: string | null
  number: number
  state: 'open' | 'closed'
}

export const GRANT_ID_PATTERN = /^\d{6,7}$/

/**
 * Find the reports-repo issue for a grant id. This is the single source of
 * truth for turning a grant id into an issue number, so callers never trust a
 * client-supplied issue number. Only exact numeric grant ids are accepted, and
 * they are matched as a whole token in the issue title, so the lookup cannot be
 * used as a substring search over the repo.
 */
export async function findGrantIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  grantId: string
): Promise<GrantIssue | undefined> {
  if (!GRANT_ID_PATTERN.test(grantId)) {
    return undefined
  }

  const pattern = new RegExp(`\\b${grantId}\\b`)

  for await (const { data: issues } of octokit.paginate.iterator(
    octokit.rest.issues.listForRepo,
    { owner, repo, state: 'all', per_page: 100 }
  )) {
    const found = issues.find((issue) => pattern.test(issue.title || ''))

    if (found) {
      return {
        title: found.title,
        body: found.body,
        number: found.number,
        state: found.state as 'open' | 'closed',
      }
    }
  }

  return undefined
}
