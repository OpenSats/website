import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { ERROR_MESSAGES } from '../../utils/constants'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_REPORTS_REPO = process.env.GH_REPORTS_REPO

interface ValidationResponse {
  valid: boolean
  project_name?: string
  issue_number?: number
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' })
  }

  const { grant_id } = req.body

  const normalizedGrantId = String(grant_id || '').trim()

  if (!normalizedGrantId) {
    return res.status(400).json({ valid: false, error: 'Grant ID is required' })
  }

  if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_REPORTS_REPO) {
    console.error('Missing GitHub configuration')
    return res
      .status(500)
      .json({ valid: false, error: 'Server configuration error' })
  }

  // Development/testing condition
  if (
    process.env.NODE_ENV === 'development' &&
    normalizedGrantId === '123456'
  ) {
    return res.status(200).json({
      valid: true,
      project_name: 'Test Grant',
      issue_number: 123,
    })
  }

  try {
    const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })

    // Iterate through all issues using pagination and stop when we find a match
    let matchingIssue:
      | { title: string; body?: string | null; number: number }
      | undefined

    for await (const { data: issues } of octokit.paginate.iterator(
      octokit.rest.issues.listForRepo,
      {
        owner: GH_ORG,
        repo: GH_REPORTS_REPO,
        state: 'all',
        per_page: 100,
      }
    )) {
      const found = issues.find((issue) => {
        const titleContainsGrantId = issue.title?.includes(normalizedGrantId)
        const bodyContainsGrantId =
          issue.body?.includes(normalizedGrantId) || false
        return Boolean(titleContainsGrantId || bodyContainsGrantId)
      })

      if (found) {
        matchingIssue = {
          title: found.title,
          body: found.body,
          number: found.number,
        }
        break
      }
    }

    if (!matchingIssue) {
      return res.status(404).json({
        valid: false,
        error: ERROR_MESSAGES.GRANT_NOT_FOUND,
      })
    }

    // Extract project name from issue title
    const project_name = matchingIssue.title
      .replace(/^Grant #\d+:\s*/, '')
      .replace(/\s+by\s+.*$/, '')

    return res.status(200).json({
      valid: true,
      project_name,
      issue_number: matchingIssue.number,
    })
  } catch (error) {
    console.error('Error validating grant:', error)
    return res
      .status(500)
      .json({ valid: false, error: 'Error validating grant' })
  }
}
