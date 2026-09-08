import { Octokit } from '@octokit/rest'
import { ERROR_MESSAGES } from './constants'
import { titleMatchesGrantId } from './grant-id'

export type GrantIssue = {
  title: string
  number: number
  state: 'open' | 'closed'
}

export type FindGrantIssueResult =
  | { ok: true; issue: GrantIssue }
  | { ok: false; status: 404 | 409 | 500; error: string }

const DEV_GRANT_ID = '123456'

export async function findGrantIssue(
  octokit: Octokit,
  grantId: string
): Promise<FindGrantIssueResult> {
  if (process.env.NODE_ENV === 'development' && grantId === DEV_GRANT_ID) {
    return {
      ok: true,
      issue: { title: 'Test Grant', number: 123, state: 'open' },
    }
  }

  const owner = process.env.GH_ORG
  const repo = process.env.GH_REPORTS_REPO
  if (!owner || !repo) {
    return { ok: false, status: 500, error: 'Server configuration error' }
  }

  try {
    for await (const { data: issues } of octokit.paginate.iterator(
      octokit.rest.issues.listForRepo,
      {
        owner,
        repo,
        state: 'all',
        per_page: 100,
      }
    )) {
      const found = issues.find((issue) =>
        titleMatchesGrantId(issue.title, grantId)
      )

      if (!found) continue

      if (found.state === 'closed') {
        return { ok: false, status: 409, error: ERROR_MESSAGES.PAST_GRANT }
      }

      return {
        ok: true,
        issue: {
          title: found.title,
          number: found.number,
          state: found.state as 'open' | 'closed',
        },
      }
    }

    return { ok: false, status: 404, error: ERROR_MESSAGES.GRANT_NOT_FOUND }
  } catch (error) {
    console.error('Error looking up grant:', error)
    return { ok: false, status: 500, error: 'Error validating grant' }
  }
}