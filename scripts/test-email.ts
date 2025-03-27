import { sendReportConfirmationEmail, sendEmailWithRetry } from '../utils/email'
import { sanitizeEmail, sanitizeMarkdown } from '../utils/sanitize'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Replace this with your actual email address
const TEST_EMAIL = process.argv[2] || 'your-email@example.com'

// Sample report content in Markdown format
const sampleReportContent = `# Progress Report #1 for Test Project

## Project Updates
During this quarter, we made significant progress on our project. We completed the following key milestones:
- Implemented the core functionality
- Conducted user testing with 10 participants
- Fixed 15 critical bugs
- Released version 0.2.0 to beta testers

## Plans for Next Quarter
In the upcoming quarter, we plan to:
1. Implement user feedback from beta testing
2. Add support for mobile devices
3. Improve performance by optimizing database queries
4. Begin work on version 1.0 release

## Use of Funds
The grant funds were used as follows:
- Developer salaries: 70%
- Infrastructure costs: 20%
- Testing and QA: 10%

## Support Needed
We would appreciate guidance on scaling our infrastructure to handle increased user load.`

async function testEmail() {
  console.log('Testing email with FORCE_REAL_EMAILS=true')
  console.log(`Sending test email to: ${TEST_EMAIL}`)
  console.log(`From: ${process.env.EMAIL_FROM || 'support@opensats.org'}`)
  console.log(
    `API Key (first 4 chars): ${
      process.env.SENDGRID_API_KEY?.substring(0, 4) || 'not set'
    }`
  )
  console.log(
    `FORCE_REAL_EMAILS: ${process.env.FORCE_REAL_EMAILS || 'not set'}`
  )

  // Test sanitization
  console.log('\n--- Testing Input Sanitization ---')
  const sanitizedEmail = sanitizeEmail(TEST_EMAIL)
  console.log(`Original email: ${TEST_EMAIL}`)
  console.log(`Sanitized email: ${sanitizedEmail}`)

  const sanitizedContent = sanitizeMarkdown(sampleReportContent)
  console.log(
    `Markdown sanitization applied: ${
      sanitizedContent.length === sampleReportContent.length
        ? 'No changes needed'
        : 'Content sanitized'
    }`
  )

  // Test with potentially problematic content
  const problematicContent =
    sampleReportContent + '\n<script>alert("XSS")</script>'
  const sanitizedProblematic = sanitizeMarkdown(problematicContent)
  console.log(
    `Sanitized problematic content (script removed): ${!sanitizedProblematic.includes(
      '<script>'
    )}`
  )

  try {
    // Test sending a real email with report content
    console.log('\n--- Testing Regular Email Sending ---')
    const result = await sendReportConfirmationEmail(
      sanitizedEmail,
      'Test Project',
      '1',
      'https://github.com/OpenSats/reports/issues/123#issuecomment-123456789',
      sanitizedContent
    )

    console.log(`Email sent successfully: ${result}`)

    // Test retry functionality (only if FORCE_REAL_EMAILS is true)
    if (process.env.FORCE_REAL_EMAILS === 'true') {
      console.log('\n--- Testing Retry Functionality ---')
      console.log(
        'Sending email with retry logic (should succeed on first try)'
      )

      const retryResult = await sendEmailWithRetry({
        to: sanitizedEmail,
        subject: 'Test Email with Retry Logic',
        text: 'This is a test of the retry functionality',
        html: '<p>This is a test of the retry functionality</p>',
        forceDev: true,
      })

      console.log(`Email with retry logic sent successfully: ${retryResult}`)
    }
  } catch (error) {
    console.error('Error sending test email:', error)
  }
}

testEmail()
