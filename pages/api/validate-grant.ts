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
  email?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' })
  }

  const { grant_id, email } = req.body

  if (!grant_id || !email) {
    return res
      .status(400)
      .json({ valid: false, error: 'Grant ID and email are required' })
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

    // Search for an issue with the grant ID in the title or body
    const searchResult = await octokit.rest.search.issuesAndPullRequests({
      q: `${grant_id} in:title,body repo:${GH_ORG}/${GH_REPORTS_REPO}`,
    })

    if (searchResult.data.total_count === 0) {
      return res.status(404).json({
        valid: false,
        error: ERROR_MESSAGES.GRANT_NOT_FOUND,
      })
    }

    // Get the first matching issue
    const issue = searchResult.data.items[0]

    // Extract project name from issue title
    const project_name = issue.title.replace(/^Grant #\d+:\s*/, '') // Remove grant number prefix

    return res.status(200).json({
      valid: true,
      project_name,
      issue_number: issue.number,
      email,
    })
  } catch (error) {
    console.error('Error validating grant:', error)
    return res
      .status(500)
      .json({ valid: false, error: 'Error validating grant' })
  }
}
