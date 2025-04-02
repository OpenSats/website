import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { withSessionRoute } from '@/lib/session'
import { sendReportConfirmationEmail } from '../../utils/email'
import CryptoJS from 'crypto-js'

interface ReportBotRequest extends NextApiRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
  body: {
    grant_id?: string
    issue_number?: number
    report_content?: string
    project_name: string
    report_number?: string
    time_spent?: string
    next_quarter?: string
    money_usage?: string
    help_needed?: string
    email_hash?: string
    email?: string
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
  console.log('Starting submitReport function')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('GitHub configuration:', {
    hasBotToken: !!process.env.GH_BOT_TOKEN,
    hasAccessToken: !!process.env.GH_ACCESS_TOKEN,
    org: process.env.GH_ORG,
    repo: process.env.GH_REPORTS_REPO,
  })

  // Log which token is being used
  const usingBotToken = !!process.env.GH_BOT_TOKEN
  console.log(
    `Using ${usingBotToken ? 'bot token' : 'regular token'} for submission`
  )

  // Use the bot token if available, otherwise fall back to regular token
  const token = process.env.GH_BOT_TOKEN || process.env.GH_ACCESS_TOKEN

  if (!token || !process.env.GH_ORG || !process.env.GH_REPORTS_REPO) {
    console.error('Missing GitHub configuration:', {
      hasToken: !!token,
      org: process.env.GH_ORG,
      repo: process.env.GH_REPORTS_REPO,
    })
    throw new Error('GitHub configuration missing')
  }

  // Special case for issue #231 - always use real GitHub API
  if (issueNumber === 231) {
    console.log('Using real GitHub API for issue #231 test case')
    try {
      const octokit = new Octokit({
        auth: token,
      })

      console.log(
        `Submitting to GitHub as ${
          usingBotToken ? 'OpenSatsBot' : 'personal account'
        }`
      )
      console.log(
        `Repository: ${process.env.GH_ORG}/${process.env.GH_REPORTS_REPO}, Issue: ${issueNumber}`
      )

      // Post the report as a comment
      console.log('Attempting to create comment...')
      const { data: comment } = await octokit.rest.issues.createComment({
        owner: process.env.GH_ORG,
        repo: process.env.GH_REPORTS_REPO,
        issue_number: issueNumber,
        body: reportContent,
      })

      console.log('Successfully posted comment to GitHub:', comment.html_url)

      // If email is provided, send confirmation email
      if (email && reportNumber) {
        console.log('Sending confirmation email...')
        await sendReportConfirmationEmail(
          email,
          projectName,
          reportNumber,
          comment.html_url,
          reportContent
        )
        console.log('Confirmation email sent')
      }

      return {
        success: true,
        message: 'Report submitted successfully',
        url: comment.html_url,
      }
    } catch (error) {
      console.error('Error submitting report to GitHub:', error)
      throw new Error(`Failed to submit report: ${error.message}`)
    }
  }

  // Development mode check for other test cases
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
        mockUrl,
        reportContent
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

  // Regular submission for all other cases
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
        comment.html_url,
        reportContent
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
  console.log('Report bot handler called with body:', req.body)

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method)
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' })
  }

  const {
    issue_number,
    project_name,
    report_number,
    time_spent,
    next_quarter,
    money_usage,
    help_needed,
    email,
  } = req.body

  if (!issue_number || !project_name || !report_number) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    })
  }

  try {
    // Construct the report content
    const reportContent = `# Progress Report # ${report_number} for ${project_name}

## Time Spent & Progress Made
${time_spent}

## Plans for Next Quarter
${next_quarter}

## Grant Money Usage
${money_usage}

${help_needed ? `## Help or Support Needed\n${help_needed}` : ''}`

    console.log('Extracted data:', {
      issue_number,
      project_name,
      report_number,
      email,
    })

    // Use the email from the request body
    console.log('Using email:', email)

    const result = await submitReport(
      issue_number,
      reportContent,
      project_name,
      email,
      report_number
    )

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error in report bot handler:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit report',
    })
  }
}

export default withSessionRoute(handler)
