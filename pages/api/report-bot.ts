import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { withSessionRoute } from '@/lib/session'
import { sendReportConfirmationEmail } from '../../utils/email'

interface ReportBotRequest extends NextApiRequest {
  session: {
    email?: string
    grantId?: string
    issueNumber?: number
    projectName?: string
  }
  body: {
    grant_id?: string
    issue_number?: number
    report_content: string
    project_name: string
    report_number?: string
  }
}

interface ReportBotResponse {
  success: boolean
  message: string
  url?: string
}

// Helper function to submit a report as a comment on an issue
async function submitReport(
  issueNumber: number,
  reportContent: string,
  projectName: string,
  email?: string,
  reportNumber?: string
) {
  // Log which token is being used
  const usingBotToken = !!process.env.GH_BOT_TOKEN
  console.log(
    `Using ${usingBotToken ? 'bot token' : 'regular token'} for submission`
  )

  // Use the bot token if available, otherwise fall back to regular token
  const token = process.env.GH_BOT_TOKEN || process.env.GH_ACCESS_TOKEN

  if (
    process.env.NODE_ENV === 'development' &&
    (issueNumber === 123 || issueNumber === 231)
  ) {
    // Mock successful submission in development mode
    console.log('Development mode: Simulating successful report submission')
    console.log(`Project: ${projectName}, Issue: ${issueNumber}`)
    console.log('Report content:', reportContent)

    // If email is provided, send confirmation email
    if (email && reportNumber) {
      const mockUrl = `https://github.com/${process.env.GH_ORG || 'OpenSats'}/${
        process.env.GH_REPORTS_REPO || 'reports'
      }/issues/${issueNumber}#issuecomment-dev-mode`
      await sendReportConfirmationEmail(
        email,
        projectName,
        reportNumber,
        mockUrl
      )
    }

    return {
      success: true,
      message: 'Report submitted successfully (development mode)',
      url: `https://github.com/${process.env.GH_ORG || 'OpenSats'}/${
        process.env.GH_REPORTS_REPO || 'reports'
      }/issues/${issueNumber}#issuecomment-dev-mode`,
    }
  }

  if (!token || !process.env.GH_ORG || !process.env.GH_REPORTS_REPO) {
    throw new Error('GitHub configuration missing')
  }

  try {
    const octokit = new Octokit({
      auth: token,
    })

    // Post the report as a comment
    const { data: comment } = await octokit.rest.issues.createComment({
      owner: process.env.GH_ORG,
      repo: process.env.GH_REPORTS_REPO,
      issue_number: issueNumber,
      body: reportContent,
    })

    // If email is provided, send confirmation email
    if (email && reportNumber) {
      await sendReportConfirmationEmail(
        email,
        projectName,
        reportNumber,
        comment.html_url
      )
    }

    return {
      success: true,
      message: 'Report submitted successfully',
      url: comment.html_url,
    }
  } catch (error) {
    console.error('Error submitting report:', error)
    throw new Error('Failed to submit report')
  }
}

async function handler(
  req: ReportBotRequest,
  res: NextApiResponse<ReportBotResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' })
  }

  const { issue_number, report_content, project_name, report_number } = req.body

  if (!issue_number) {
    return res
      .status(400)
      .json({ success: false, message: 'Issue number is required' })
  }

  if (!report_content) {
    return res
      .status(400)
      .json({ success: false, message: 'Report content is required' })
  }

  if (!project_name) {
    return res
      .status(400)
      .json({ success: false, message: 'Project name is required' })
  }

  // Get email from session if available
  const email = req.session?.email

  try {
    const result = await submitReport(
      issue_number,
      report_content,
      project_name,
      email,
      report_number
    )
    return res.status(200).json(result)
  } catch (error) {
    console.error('Error in report bot:', error)
    return res.status(500).json({
      success: false,
      message: 'Error submitting report. Please try again or contact support.',
    })
  }
}

export default withSessionRoute(handler)
