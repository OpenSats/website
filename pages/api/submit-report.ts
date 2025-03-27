import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import { withSessionRoute } from '@/lib/session'
import { sendReportConfirmationEmail } from '../../utils/email'
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeMarkdown,
} from '../../utils/sanitize'

interface SubmitReportRequest extends NextApiRequest {
  session: any
  body: {
    project_name: string
    report_number: string
    time_spent: string
    next_quarter: string
    money_usage: string
    help_needed?: string
    issue_number: number
    email_hash?: string
  }
}

interface SubmitReportResponse {
  message: string
  comment_url?: string
  preview_mode?: boolean
  error?: string
}

function formatReport(data: SubmitReportRequest['body']): string {
  // Sanitize all input fields
  const projectName = sanitizeString(data.project_name, 200)
  const reportNumber = sanitizeString(data.report_number, 10)
  const timeSpent = sanitizeMarkdown(data.time_spent)
  const nextQuarter = sanitizeMarkdown(data.next_quarter)
  const moneyUsage = sanitizeMarkdown(data.money_usage)
  const helpNeeded = data.help_needed ? sanitizeMarkdown(data.help_needed) : ''

  const sections = [
    `# Progress Report # ${reportNumber} for ${projectName}`,
    '',
    '## Project Updates',
    timeSpent,
    '',
    '## Plans for Next Quarter',
    nextQuarter,
    '',
    '## Use of Funds',
    moneyUsage,
  ]

  // Only include Support needed section if it's filled in (not empty or just whitespace)
  if (helpNeeded && helpNeeded.trim()) {
    sections.push('', '## Support needed', helpNeeded)
  }

  return sections.join('\n')
}

async function sendReportEmail(
  email: string,
  data: SubmitReportRequest['body'],
  reportContent: string,
  commentUrl?: string
) {
  // Sanitize email address
  const sanitizedEmail = sanitizeEmail(email)

  if (!sanitizedEmail) {
    console.error('Cannot send email: Invalid email address provided')
    return false
  }

  try {
    console.log(
      `Sending report confirmation email to ${sanitizedEmail} for project "${data.project_name}" (Report #${data.report_number})`
    )

    const result = await sendReportConfirmationEmail(
      sanitizedEmail,
      sanitizeString(data.project_name, 200),
      sanitizeString(data.report_number, 10),
      commentUrl ||
        `https://github.com/OpenSats/reports/issues/${data.issue_number}`,
      reportContent
    )

    if (result) {
      console.log(
        `Email sent successfully to ${sanitizedEmail} for project "${data.project_name}"`
      )
      return true
    } else {
      console.error(
        `Email sending failed to ${sanitizedEmail} for project "${data.project_name}"`
      )
      return false
    }
  } catch (error) {
    console.error('Error sending report confirmation email:', error)
    console.error('Email context:', {
      recipient: sanitizedEmail,
      project: data.project_name,
      reportNumber: data.report_number,
      issueNumber: data.issue_number,
      commentUrlProvided: !!commentUrl,
    })
    return false
  }
}

// Verify that the issue has a valid grant number
async function verifyGrantNumber(issueNumber: number): Promise<boolean> {
  // Skip verification in development mode
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  if (
    !process.env.GH_ACCESS_TOKEN ||
    !process.env.GH_ORG ||
    !process.env.GH_REPORTS_REPO
  ) {
    throw new Error('GitHub configuration missing')
  }

  try {
    const octokit = new Octokit({
      auth: process.env.GH_ACCESS_TOKEN,
    })

    // Get the issue
    const { data: issue } = await octokit.rest.issues.get({
      owner: process.env.GH_ORG,
      repo: process.env.GH_REPORTS_REPO,
      issue_number: issueNumber,
    })

    // Check if the issue body contains a grant number
    const grantNumberRegex = /Grant number: (\d{6,7})/
    return grantNumberRegex.test(issue.body || '')
  } catch (error) {
    console.error('Error verifying grant number:', error)
    return false
  }
}

// Helper function to submit a report as a comment on an issue using the bot
async function submitReportViaBot(
  issueNumber: number,
  reportContent: string,
  projectName: string
) {
  // Log which token is being used
  const usingBotToken = !!process.env.GH_BOT_TOKEN
  console.log(
    `Using ${usingBotToken ? 'bot token' : 'regular token'} for submission`
  )

  // Use the bot token if available, otherwise fall back to regular token
  const token = process.env.GH_BOT_TOKEN || process.env.GH_ACCESS_TOKEN

  // Special case for issue #231 - always use real GitHub API
  if (issueNumber === 231) {
    console.log('Using real GitHub API for issue #231 test case')

    if (!token || !process.env.GH_ORG || !process.env.GH_REPORTS_REPO) {
      throw new Error('GitHub configuration missing')
    }

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
      const { data: comment } = await octokit.rest.issues.createComment({
        owner: process.env.GH_ORG,
        repo: process.env.GH_REPORTS_REPO,
        issue_number: issueNumber,
        body: reportContent,
      })

      console.log('Successfully posted comment to GitHub:', comment.html_url)

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

  // For other test cases in development mode, simulate submission
  if (process.env.NODE_ENV === 'development' && issueNumber === 123) {
    // Mock successful submission in development mode
    console.log('Development mode: Simulating successful report submission')
    console.log(`Project: ${projectName}, Issue: ${issueNumber}`)
    console.log('Report content:', reportContent)

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
  req: SubmitReportRequest,
  res: NextApiResponse<SubmitReportResponse>
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    if (!req.session.email) {
      return res.status(401).json({ message: 'Session expired' })
    }

    const data = req.body

    // In development mode, skip GitHub checks for test cases
    if (process.env.NODE_ENV === 'development' && data.issue_number !== 231) {
      try {
        // Format and submit the report
        const reportContent = formatReport(data)

        // Send email with the report
        await sendReportEmail(req.session.email, data, reportContent)

        // Clear the session after successful submission
        req.session.destroy()

        return res.status(200).json({
          message: 'success',
          comment_url:
            'https://github.com/OpenSats/reports/issues/' +
            data.issue_number +
            '#issuecomment-dev-mode',
        })
      } catch (error) {
        console.error('Error submitting report in development mode:', error)
        return res.status(500).json({
          message: 'Error submitting report',
          error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        })
      }
    }

    // Check GitHub configuration
    if (!process.env.GH_ORG || !process.env.GH_REPORTS_REPO) {
      return res.status(500).json({ message: 'GitHub configuration missing' })
    }

    try {
      // Verify that the issue has a valid grant number
      const hasGrantNumber = await verifyGrantNumber(data.issue_number)
      // Only enforce grant number validation in production
      const isProduction = process.env.NODE_ENV === 'production'
      if (!hasGrantNumber && isProduction) {
        return res.status(400).json({
          message:
            'Cannot submit report: The grant issue does not have a valid grant number. Please contact support.',
        })
      }

      // Format the report
      const reportContent = formatReport(data)

      try {
        // In preview environment, simulate a successful submission
        if (
          process.env.VERCEL_ENV === 'preview' ||
          (process.env.NODE_ENV !== 'production' && !process.env.GH_BOT_TOKEN)
        ) {
          console.log('Preview mode: Simulating successful report submission')

          // Simulate a comment URL for preview environments
          const previewCommentUrl = `https://github.com/${
            process.env.GH_ORG || 'OpenSats'
          }/${process.env.GH_REPORTS_REPO || 'reports'}/issues/${
            data.issue_number
          }#preview-comment`

          // Send email with the report (if email is configured)
          if (
            process.env.EMAIL_HOST &&
            process.env.EMAIL_USER &&
            process.env.EMAIL_PASS
          ) {
            await sendReportEmail(
              req.session.email,
              data,
              reportContent,
              previewCommentUrl
            )
          } else {
            console.log('Preview mode: Email not sent (email not configured)')
          }

          // Clear the session after successful simulation
          req.session.destroy()

          return res.status(200).json({
            message: 'success',
            comment_url: previewCommentUrl,
            preview_mode: true,
          })
        }

        // Submit the report via the bot
        const botResult = await submitReportViaBot(
          data.issue_number,
          reportContent,
          data.project_name
        )

        // Get the comment URL for the email
        const commentUrl = botResult.url

        // Send email with the report
        await sendReportEmail(
          req.session.email,
          data,
          reportContent,
          commentUrl
        )

        // Clear the session after successful submission
        req.session.destroy()

        return res.status(200).json({
          message: 'success',
          comment_url: commentUrl,
        })
      } catch (error) {
        console.error('Error posting with bot:', error)
        return res.status(500).json({
          message:
            'Error submitting report with bot account. Please ensure the bot has access to the repository.',
          error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        })
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      return res.status(500).json({
        message: 'Error submitting report',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  } catch (error) {
    console.error('Unhandled error in submit-report API:', error)
    return res.status(500).json({
      message:
        'An unexpected error occurred while processing your report submission. Please try again or contact support.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

export default withSessionRoute(handler)
