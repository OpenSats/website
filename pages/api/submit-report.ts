import type { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import nodemailer from 'nodemailer'
import { withSessionRoute } from '@/lib/session'

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
}

function formatReport(data: SubmitReportRequest['body']): string {
  const sections = [
    `# Progress Report # ${data.report_number} for ${data.project_name}`,
    '',
    '## Project Updates',
    data.time_spent,
    '',
    '## Plans for Next Quarter',
    data.next_quarter,
    '',
    '## Use of Funds',
    data.money_usage,
  ]

  // Only include Support needed section if it's filled in (not empty or just whitespace)
  if (data.help_needed && data.help_needed.trim()) {
    sections.push(
      '',
      '## Support needed',
      data.help_needed
    )
  }

  return sections.join('\n')
}

async function sendReportEmail(email: string, data: SubmitReportRequest['body'], reportContent: string, commentUrl?: string) {
  // In development mode, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('Email would be sent to:', email)
    console.log('Subject: Your OpenSats Progress Report')
    console.log('Content:', reportContent)
    if (commentUrl) {
      console.log('Comment URL:', commentUrl)
    }
    return
  }

  // In production, send the actual email
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration missing')
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const emailContent = `
    <h1>Your OpenSats Progress Report</h1>
    <p>Thank you for submitting your progress report. Below is a copy for your records:</p>
    <hr />
    ${reportContent.replace(/\n/g, '<br />')}
    <hr />
    ${commentUrl ? `<p>You can view your report on GitHub at: <a href="${commentUrl}">${commentUrl}</a></p>` : ''}
  `

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    cc: process.env.REPORT_CC_EMAIL,
    subject: `OpenSats Progress Report for ${data.project_name}`,
    html: emailContent,
  }

  await transporter.sendMail(mailOptions)
}

// Verify that the issue has a valid grant number
async function verifyGrantNumber(issueNumber: number): Promise<boolean> {
  // Skip verification in development mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!process.env.GH_ACCESS_TOKEN || !process.env.GH_ORG || !process.env.GH_REPORTS_REPO) {
    throw new Error('GitHub configuration missing');
  }

  try {
    const octokit = new Octokit({
      auth: process.env.GH_ACCESS_TOKEN,
    });

    // Get the issue
    const { data: issue } = await octokit.rest.issues.get({
      owner: process.env.GH_ORG,
      repo: process.env.GH_REPORTS_REPO,
      issue_number: issueNumber,
    });

    // Check if the issue body contains a grant number
    const grantNumberRegex = /Grant number: (\d{6,7})/;
    return grantNumberRegex.test(issue.body || '');
  } catch (error) {
    console.error('Error verifying grant number:', error);
    return false;
  }
}

async function handler(
  req: SubmitReportRequest,
  res: NextApiResponse<SubmitReportResponse>
) {
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
        comment_url: 'https://github.com/OpenSats/reports/issues/' + data.issue_number + '#issuecomment-dev-mode'
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      return res.status(500).json({ message: 'Error submitting report' })
    }
  }

  // Production mode: Check GitHub configuration
  if (process.env.NODE_ENV === 'production' && !process.env.GH_BOT_TOKEN) {
    return res.status(500).json({ message: 'Bot token missing. Reports must be submitted by the bot.' })
  }

  if (!process.env.GH_ORG || !process.env.GH_REPORTS_REPO) {
    return res.status(500).json({ message: 'GitHub configuration missing' })
  }

  // Use bot token if available, or a placeholder in development/preview
  const githubToken = process.env.GH_BOT_TOKEN || (process.env.NODE_ENV !== 'production' ? 'preview-mode-token' : '')
  
  // Log which token is being used (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Server-side log: Using bot token for GitHub API')
  }

  try {
    // Verify that the issue has a valid grant number
    const hasGrantNumber = await verifyGrantNumber(data.issue_number);
    if (!hasGrantNumber && process.env.NODE_ENV !== 'development') {
      return res.status(400).json({ 
        message: 'Cannot submit report: The grant issue does not have a valid grant number. Please contact support.' 
      });
    }

    // Initialize Octokit with the token
    const octokit = new Octokit({
      auth: githubToken,
    })

    // Format the report
    const reportContent = formatReport(data)

    try {
      // In preview environment, simulate a successful submission
      if (process.env.VERCEL_ENV === 'preview' || (process.env.NODE_ENV !== 'production' && !process.env.GH_BOT_TOKEN)) {
        console.log('Preview mode: Simulating successful report submission');
        
        // Simulate a comment URL for preview environments
        const previewCommentUrl = `https://github.com/${process.env.GH_ORG || 'OpenSats'}/${process.env.GH_REPORTS_REPO || 'reports'}/issues/${data.issue_number}#preview-comment`;
        
        // Send email with the report (if email is configured)
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          await sendReportEmail(req.session.email, data, reportContent, previewCommentUrl);
        } else {
          console.log('Preview mode: Email not sent (email not configured)');
        }
        
        // Clear the session after successful simulation
        req.session.destroy();
        
        return res.status(200).json({ 
          message: 'success',
          comment_url: previewCommentUrl,
          preview_mode: true
        });
      }
      
      // For production or development with token, create the actual comment
      const comment = await octokit.rest.issues.createComment({
        owner: process.env.GH_ORG,
        repo: process.env.GH_REPORTS_REPO,
        issue_number: data.issue_number,
        body: reportContent,
      })

      // Get the comment URL for the email
      const commentUrl = comment.data.html_url;

      // Send email with the report
      await sendReportEmail(req.session.email, data, reportContent, commentUrl)

      // Clear the session after successful submission
      req.session.destroy()

      return res.status(200).json({ 
        message: 'success',
        comment_url: commentUrl
      })
    } catch (error) {
      console.error('Error posting with bot token:', error)
      return res.status(500).json({ 
        message: 'Error submitting report with bot account. Please ensure the bot has access to the repository.'
      })
    }
  } catch (error) {
    console.error('Error submitting report:', error)
    return res.status(500).json({ message: 'Error submitting report' })
  }
}

export default withSessionRoute(handler)
