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

  if (!grant_id) {
    return res.status(400).json({ valid: false, error: 'Grant ID is required' })
  }

  if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_REPORTS_REPO) {
    console.error('Missing GitHub configuration')
    return res
      .status(500)
      .json({ valid: false, error: 'Server configuration error' })
  }

  // Development/testing condition
  if (process.env.NODE_ENV === 'development' && grant_id === '123456') {
    return res.status(200).json({
      valid: true,
      project_name: 'Test Grant',
      issue_number: 123,
    })
  }

  try {
    const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })

    // Instead of using the deprecated search API, we'll list all issues and filter locally
    // This approach is more reliable and avoids the deprecation warning
    const issuesResponse = await octokit.rest.issues.listForRepo({
      owner: GH_ORG,
      repo: GH_REPORTS_REPO,
      state: 'all', // Include both open and closed issues
      per_page: 100, // Get up to 100 issues per page
    })

    // Filter issues to find the one containing the grant ID
    const matchingIssue = issuesResponse.data.find((issue) => {
      const titleContainsGrantId = issue.title.includes(grant_id)
      const bodyContainsGrantId = issue.body?.includes(grant_id) || false
      return titleContainsGrantId || bodyContainsGrantId
    })

    if (!matchingIssue) {
      return res.status(404).json({
        valid: false,
        error: ERROR_MESSAGES.GRANT_NOT_FOUND,
      })
    }

    // Extract project name from issue title
    const project_name = matchingIssue.title
      .replace(/^Grant #\d+:\s*/, '') // Remove grant number prefix
      .replace(/\s+by\s+.*$/, '') // Remove everything after "by" (including "by" itself)

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
