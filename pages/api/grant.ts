import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { findGrantIssue } from '../../utils/find-grant-issue'
import { parseGrantIdInput, projectNameFromTitle } from '../../utils/grant-id'
import { assertTurnstile, TURNSTILE_FAILURE_MESSAGE } from '@/utils/turnstile'

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
    return res.status(403).json({
      valid: false,
      error: TURNSTILE_FAILURE_MESSAGE,
    })
  }

  const parsedGrantId = parseGrantIdInput(req.body.grant_id)
  if (parsedGrantId.ok === false) {
    return res.status(400).json({ valid: false, error: parsedGrantId.error })
  }

  if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_REPORTS_REPO) {
    console.error('Missing GitHub configuration')
    return res
      .status(500)
      .json({ valid: false, error: 'Server configuration error' })
  }

  const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })
  const result = await findGrantIssue(octokit, parsedGrantId.grantId)

  if (result.ok === false) {
    return res.status(result.status).json({
      valid: false,
      error: result.error,
    })
  }

  return res.status(200).json({
    valid: true,
    project_name: projectNameFromTitle(result.issue.title),
    issue_number: result.issue.number,
  })
}
