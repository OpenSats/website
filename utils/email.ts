import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

interface ReportEmailParams {
  to: string
  project_name: string
  report_number: string
  report_content: string
}

export async function sendReportConfirmationEmail({
  to,
  project_name,
  report_number,
  report_content,
}: ReportEmailParams) {
  const html = `
    <h1>Report Submission Confirmation</h1>
    <p>Your progress report for ${project_name} has been submitted successfully.</p>
    <h2>Report Details</h2>
    <pre>${report_content}</pre>
  `

  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'support@opensats.org',
    subject: `Progress Report ${report_number} Submitted - ${project_name}`,
    text: `Your progress report for ${project_name} has been submitted successfully.\n\n${report_content}`,
    html,
  }

  try {
    await sgMail.send(msg)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
} 