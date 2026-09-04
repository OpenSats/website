import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { sendReportConfirmationEmail } from './sendgrid'
import { generateReportContent } from '../../utils/api-helpers'
import { assertTurnstile, TURNSTILE_FAILURE_MESSAGE } from '@/utils/turnstile'
import { findGrantIssue } from '@/utils/grant-lookup'
import { ERROR_MESSAGES } from '../../utils/constants'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_REPORTS_REPO = process.env.GH_REPORTS_REPO

interface ReportBotRequest extends NextApiRequest {
  body: {
    project_name: string
    own_words: string
    time_spent: string
    next_quarter: string
    money_usage: string
    help_needed?: string
    grant_id: string
    email: string
  }
}

interface ReportBotResponse {
  success: boolean
  report?: {
    id: number
    node_id: string
    url: string
    body?: string
    body_text?: string
    body_html?: string
    html_url: string
    user: {
      name?: string
      email?: string
      login: string
      id: number
      node_id: string
      avatar_url: string
      type: string
    }
    created_at?: string
    updated_at?: string
    reactions?: {
      url: string
      total_count: number
      [key: string]: unknown
    }
  }
  error?: string
  details?: unknown
}

export default async function handler(
  req: ReportBotRequest,
  res: NextApiResponse<ReportBotResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  if (!(await assertTurnstile(req))) {
    return res.status(403).json({
      success: false,
      error: TURNSTILE_FAILURE_MESSAGE,
    })
  }

  if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_REPORTS_REPO) {
    console.error('Missing GitHub configuration')
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
    })
  }

  try {
    const {
      project_name: original_project_name,
      own_words,
      time_spent,
      next_quarter,
      money_usage,
      help_needed,
      grant_id,
      email,
    } = req.body

    // Input validation
    if (
      !original_project_name ||
      !own_words ||
      !time_spent ||
      !next_quarter ||
      !money_usage ||
      !grant_id ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    // Clean up project name to remove the "by" part
    const project_name = original_project_name.replace(/\s+by\s+.*$/, '')

    const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })

    // Resolve the issue from the grant id server-side so the comment target is
    // never taken from the request body.
    const grantIssue = await findGrantIssue(
      octokit,
      GH_ORG,
      GH_REPORTS_REPO,
      String(grant_id).trim()
    )

    if (!grantIssue) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.GRANT_NOT_FOUND,
      })
    }

    if (grantIssue.state === 'closed') {
      return res.status(409).json({
        success: false,
        error: ERROR_MESSAGES.PAST_GRANT,
      })
    }

    const issue_number = grantIssue.number

    // Create report content in markdown format using the shared function
    const reportContent = generateReportContent({
      project_name,
      own_words,
      time_spent,
      next_quarter,
      money_usage,
      help_needed,
    })

    // Add the report as a comment to the existing issue
    const response = await octokit.rest.issues.createComment({
      owner: GH_ORG,
      repo: GH_REPORTS_REPO,
      issue_number: issue_number,
      body: reportContent,
    })

    // Send confirmation email
    await sendReportConfirmationEmail(
      email,
      project_name,
      response.data.html_url,
      reportContent
    )

    return res.status(200).json({
      success: true,
      report: response.data,
    })
  } catch (error) {
    console.error(
      'Error creating report:',
      error instanceof Error ? error.message : error
    )
    return res.status(500).json({
      success: false,
      error: 'Error creating report',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    })
  }
}
