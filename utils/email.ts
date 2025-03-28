import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
  from?: string
  forceDev?: boolean
}

/**
 * Send an email using SendGrid
 * @param options Email options including to, subject, text, html, and from
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Validate required fields
  if (!options.to || !options.subject || !options.text || !options.html) {
    console.error('Missing required email fields:', {
      to: !!options.to,
      subject: !!options.subject,
      text: !!options.text,
      html: !!options.html,
    })
    return false
  }

  // Simulate email sending in development mode unless FORCE_REAL_EMAILS is set
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.FORCE_REAL_EMAILS !== 'true'
  ) {
    const { to, subject, text } = options
    console.log(' [DEV MODE] Simulating email send:')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(
      `From: ${
        options.from || process.env.EMAIL_FROM || 'support@opensats.org'
      }`
    )
    console.log(
      'Content:',
      text.substring(0, 150) + (text.length > 150 ? '...' : '')
    )
    console.log('[SIMULATED] Email sent successfully!')
    return true
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.')
    return false
  }

  const { to, subject, text, html, from } = options

  try {
    // Re-initialize SendGrid with API key every time to ensure it's using the latest key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
      to,
      from: from || process.env.EMAIL_FROM || 'support@opensats.org',
      subject,
      text,
      html,
    }

    const startTime = Date.now()
    await sgMail.send(msg)
    const duration = Date.now() - startTime

    console.log(`Email sent successfully to ${to} in ${duration}ms`)
    return true
  } catch (error: any) {
    console.error('Error sending email:', error)
    if (error.response) {
      console.error('  Status code:', error.code)
      console.error(
        '  Response body:',
        JSON.stringify(error.response.body, null, 2)
      )
    }

    // Log additional details for troubleshooting
    console.error('Email details:', {
      to,
      from: from || process.env.EMAIL_FROM || 'support@opensats.org',
      subject,
      textLength: text?.length || 0,
      htmlLength: html?.length || 0,
    })

    return false
  }
}

/**
 * Send an email using SendGrid with retry logic
 * @param options Email options including to, subject, text, html, and from
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param retryDelay Base delay in ms between retries (default: 1000, will be multiplied by attempt number)
 * @returns Promise that resolves when email is sent
 */
export async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<boolean> {
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const result = await sendEmail(options)
      if (result) return true

      // If sendEmail returned false but didn't throw, we still need to retry
      attempts++
      if (attempts < maxRetries) {
        const delay = retryDelay * attempts
        console.log(
          `Email sending attempt ${attempts} failed, retrying in ${delay}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      attempts++
      if (attempts < maxRetries) {
        const delay = retryDelay * attempts
        console.error(
          `Email sending attempt ${attempts} failed with error, retrying in ${delay}ms:`,
          error
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error(`All ${maxRetries} email sending attempts failed:`, error)
        return false
      }
    }
  }

  console.error(`Failed to send email after ${maxRetries} attempts`)
  return false
}

/**
 * Send a confirmation email for a submitted report with retry logic
 * @param to Recipient email address
 * @param projectName Name of the project
 * @param reportNumber Report number
 * @param reportUrl URL to the submitted report
 * @param reportContent The markdown content of the report
 * @param forceDev Optional parameter to force development mode simulation
 * @returns Promise that resolves when email is sent
 */
export async function sendReportConfirmationEmail(
  to: string,
  projectName: string,
  reportNumber: string,
  reportUrl: string,
  reportContent?: string,
  forceDev?: boolean
): Promise<boolean> {
  const subject = `OpenSats Progress Report #${reportNumber} Submitted: ${projectName}`

  // Include report content in the plain text version if available
  const reportSection = reportContent
    ? `
Your Report Content:
${reportContent}

`
    : ''

  const text = `
Thank you for submitting your progress report for ${projectName}!

Your Progress Report #${reportNumber} has been successfully submitted to OpenSats. The OpenSats team will review your report and may reach out if they have any questions.

${reportSection}If you have any questions or need assistance, please reply to this email or contact support@opensats.org.

Best Regards,
The OpenSats Team
`

  // Convert Markdown to GitHub-style HTML for the report content
  const formattedReportContent = reportContent
    ? convertMarkdownToHtml(reportContent)
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Report Submission Confirmation</title>
  <style>
    @media only screen and (max-width: 620px) {
      table.body h1 {
        font-size: 28px !important;
        margin-bottom: 10px !important;
      }
      table.body p,
      table.body ul,
      table.body ol,
      table.body td,
      table.body span,
      table.body a {
        font-size: 16px !important;
      }
      table.body .wrapper,
      table.body .article {
        padding: 10px !important;
      }
      table.body .content {
        padding: 0 !important;
      }
      table.body .container {
        padding: 0 !important;
        width: 100% !important;
      }
      table.body .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      table.body .btn table {
        width: 100% !important;
      }
      table.body .btn a {
        width: 100% !important;
      }
      table.body .img-responsive {
        height: auto !important;
        max-width: 100% !important;
        width: auto !important;
      }
    }
    @media all {
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      .btn-primary table td:hover {
        background-color: #f5821f !important;
      }
      .btn-primary a:hover {
        background-color: #f5821f !important;
        border-color: #f5821f !important;
      }
    }
  </style>
</head>
<body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
  <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Your OpenSats progress report has been submitted successfully.</span>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
    <tr>
      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
      <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
        <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">

          <!-- START CENTERED WHITE CONTAINER -->
          <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">

            <!-- START MAIN CONTENT AREA -->
            <tr>
              <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                  <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://opensats.org/static/images/logo.png" alt="OpenSats Logo" style="max-width: 200px;">
                      </div>
                      <h1 style="color: #000000; font-family: sans-serif; font-weight: 300; line-height: 1.4; margin: 0; margin-bottom: 30px; font-size: 35px; text-align: center; text-transform: capitalize;">Report Submitted</h1>
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for submitting your progress report for <strong>${projectName}</strong>!</p>
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Your Progress Report #${reportNumber} has been successfully submitted to OpenSats. The OpenSats team will review your report and may reach out if they have any questions.</p>
                      
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                        <tbody>
                          <tr>
                            <td align="center" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                <tbody>
                                  <tr>
                                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #f5821f;" valign="top" align="center" bgcolor="#f5821f">
                                      <a href="${reportUrl}" target="_blank" style="border: solid 1px #f5821f; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #f5821f; border-color: #f5821f; color: #ffffff;">View Your Report</a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      ${
                        formattedReportContent
                          ? `
                      <div style="margin-top: 30px; margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #f5821f;">
                        <h3 style="color: #333333; font-family: sans-serif; font-weight: 400; line-height: 1.4; margin: 0; margin-bottom: 15px;">Report Content:</h3>
                        <div style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; color: #333333;">
                          ${formattedReportContent}
                        </div>
                      </div>
                      `
                          : ''
                      }
                      
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">If you have any questions or need assistance, please reply to this email or contact <a href="mailto:support@opensats.org" style="color: #f5821f; text-decoration: underline;">support@opensats.org</a>.</p>
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Best Regards,<br>The OpenSats Team</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          <!-- END MAIN CONTENT AREA -->
          </table>
          <!-- END CENTERED WHITE CONTAINER -->

          <!-- START FOOTER -->
          <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
              <tr>
                <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                  <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">OpenSats, a 501(c)(3) nonprofit organization</span>
                  <br>Don't like these emails? <a href="https://opensats.org/preferences" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">Update your preferences</a>.
                </td>
              </tr>
            </table>
          </div>
          <!-- END FOOTER -->

        </div>
      </td>
      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
    </tr>
  </table>
</body>
</html>
`

  return sendEmailWithRetry(
    {
      to,
      subject,
      text,
      html,
      forceDev,
    },
    3, // 3 retries
    1000 // 1 second base delay
  )
}

/**
 * Convert Markdown to GitHub-style HTML
 * @param markdown Markdown content to convert
 * @returns HTML content
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) {
    return ''
  }

  try {
    // Simple Markdown to HTML conversion
    return (
      markdown
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        // Lists - improved to handle nested lists better
        .replace(/^\s*[\*\-] (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
        // Code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Paragraphs (must be last)
        .replace(/^(?!<[hl]|<li|<pre)(.+)$/gm, '<p>$1</p>')
        // Fix multiple line breaks
        .replace(/\n\n+/g, '\n\n')
        // Fix lists - wrap in ul/ol tags
        .replace(/(<li>.*?<\/li>\n*)+/g, '<ul>$&</ul>')
        // Fix nested lists
        .replace(/<\/ul>\s*<ul>/g, '')
        // Escape HTML in code blocks
        .replace(
          /<code>([\s\S]*?)<\/code>/g,
          (match, p1) =>
            `<code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`
        )
    )
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error)
    // Return sanitized plain text as fallback
    return markdown
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .split('\n')
      .map((line) => `<p>${line}</p>`)
      .join('')
  }
}
