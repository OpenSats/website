import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { sendReportConfirmationEmail } from '../../utils/email'

const GH_BOT_TOKEN = process.env.GH_BOT_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_REPORTS_REPO = process.env.GH_REPORTS_REPO

interface ReportBotRequest extends NextApiRequest {
  body: {
    project_name: string
    report_number: string
    time_spent: string
    next_quarter: string
    money_usage: string
    help_needed?: string
    issue_number: number
    email: string
  }
}

export default async function handler(
  req: ReportBotRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!GH_BOT_TOKEN || !GH_ORG || !GH_REPORTS_REPO) {
    console.error('Missing GitHub configuration')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const {
      project_name,
      report_number,
      time_spent,
      next_quarter,
      money_usage,
      help_needed,
      issue_number,
      email,
    } = req.body

    const octokit = new Octokit({ auth: GH_BOT_TOKEN })

    // Create report content in markdown format
    const reportContent = `# Progress Report ${report_number}

## Time Spent
${time_spent}

## Use of Funds
${money_usage}

## Next Quarter Plans
${next_quarter}

${help_needed ? `## Help Needed\n${help_needed}` : ''}`

    // Add the report as a comment to the existing issue
    const response = await octokit.rest.issues.createComment({
      owner: GH_ORG,
      repo: GH_REPORTS_REPO,
      issue_number: issue_number,
      body: reportContent,
    })

    // Send confirmation email
    await sendReportConfirmationEmail({
      to: email,
      project_name,
      report_number,
      report_content: reportContent,
    })

    return res.status(200).json({ success: true, report: response.data })
  } catch (error) {
    console.error('Error creating report:', error)
    return res.status(500).json({ error: 'Error creating report' })
  }
} 