import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { sendReportConfirmationEmail } from './sendgrid'
import { generateReportContent } from '../../utils/api-helpers'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_REPORTS_REPO = process.env.GH_REPORTS_REPO

interface ReportBotRequest extends NextApiRequest {
  body: {
    project_name: string
    time_spent: string
    next_quarter: string
    money_usage: string
    help_needed?: string
    issue_number: number
    email: string
    company_website?: string
    form_loaded_at?: number
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
      time_spent,
      next_quarter,
      money_usage,
      help_needed,
      issue_number,
      email,
      company_website,
      form_loaded_at,
    } = req.body

    // Spam protection: Honeypot field check
    // If company_website is filled, it's likely a bot - silently reject
    if (company_website && company_website.trim() !== '') {
      console.warn('Spam detected: Honeypot field filled', {
        email: email?.substring(0, 3) + '***',
        timestamp: new Date().toISOString(),
      })
      // Return success to avoid revealing the honeypot
      return res.status(200).json({
        success: true,
      })
    }

    // Spam protection: Time-based validation
    // Require minimum time between form load and submission
    const MIN_FORM_TIME_MS =
      parseInt(process.env.SPAM_MIN_FORM_TIME || '2000', 10) || 2000

    if (form_loaded_at && typeof form_loaded_at === 'number') {
      const timeElapsed = Date.now() - form_loaded_at
      if (timeElapsed < MIN_FORM_TIME_MS) {
        console.warn('Spam detected: Form submitted too quickly', {
          timeElapsed,
          minRequired: MIN_FORM_TIME_MS,
          email: email?.substring(0, 3) + '***',
          timestamp: new Date().toISOString(),
        })
        return res.status(400).json({
          success: false,
          error: 'Invalid submission',
        })
      }
    }

    // Input validation
    if (
      !original_project_name ||
      !time_spent ||
      !next_quarter ||
      !money_usage ||
      !issue_number ||
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

    // Create report content in markdown format using the shared function
    const reportContent = generateReportContent({
      project_name,
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
