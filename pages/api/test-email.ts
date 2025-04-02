import type { NextApiRequest, NextApiResponse } from 'next'
import { sendReportConfirmationEmail } from '../../utils/email'

interface TestEmailResponse {
  success: boolean
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestEmailResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' })
  }

  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'Test endpoint only available in development mode',
    })
  }

  const { email } = req.body

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: 'Email is required' })
  }

  try {
    console.log(`Sending test email to: ${email}`)

    const result = await sendReportConfirmationEmail(
      email,
      'Test Project',
      '1',
      'https://github.com/OpenSats/reports/issues/123#issuecomment-123456789',
      '## Test Report Content\n\nThis is a test report.'
    )

    if (result) {
      return res.status(200).json({
        success: true,
        message:
          'Test email sent successfully. Check your inbox (and spam folder).',
      })
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email. Check server logs for details.',
      })
    }
  } catch (error) {
    console.error('Error sending test email:', error)
    return res.status(500).json({
      success: false,
      message: 'Error sending test email',
    })
  }
}
