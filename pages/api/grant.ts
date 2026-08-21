import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { ERROR_MESSAGES } from '../../utils/constants'
import { assertTurnstile, TURNSTILE_FAILURE_MESSAGE } from '@/utils/turnstile'
import { findGrantIssue, GRANT_ID_PATTERN } from '@/utils/grant-lookup'

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

  if (!(await assertTurnstile(req))) {
    return res.status(403).json({ valid: false, error: TURNSTILE_FAILURE_MESSAGE })
  }

  const { grant_id } = req.body

  const normalizedGrantId = String(grant_id || '').trim()

  if (!normalizedGrantId) {
    return res.status(400).json({ valid: false, error: 'Grant ID is required' })
  }

  if (!GRANT_ID_PATTERN.test(normalizedGrantId)) {
    return res
      .status(400)
      .json({ valid: false, error: 'A valid Grant ID is required' })
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

    const matchingIssue = await findGrantIssue(
      octokit,
      GH_ORG,
      GH_REPORTS_REPO,
      normalizedGrantId
    )

    if (!matchingIssue) {
      return res.status(404).json({
        valid: false,
        error: ERROR_MESSAGES.GRANT_NOT_FOUND,
      })
    }

    if (matchingIssue.state === 'closed') {
      return res.status(409).json({
        valid: false,
        error: ERROR_MESSAGES.PAST_GRANT,
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
