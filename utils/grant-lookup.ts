import { Octokit } from '@octokit/rest'

export interface GrantIssue {
  title: string
  body?: string | null
  number: number
  state: 'open' | 'closed'
}

/**
 * Find the reports-repo issue that a grant id belongs to. This is the single
 * source of truth for turning a grant id into an issue number, so callers never
 * trust a client-supplied issue number.
 */
export async function findGrantIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  grantId: string
): Promise<GrantIssue | undefined> {
  for await (const { data: issues } of octokit.paginate.iterator(
    octokit.rest.issues.listForRepo,
    { owner, repo, state: 'all', per_page: 100 }
  )) {
    const found = issues.find((issue) => {
      const inTitle = issue.title?.includes(grantId)
      const inBody = issue.body?.includes(grantId) || false
      return Boolean(inTitle || inBody)
    })

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
