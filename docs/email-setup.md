# OpenSats Email Notification Setup

This document explains how to set up and configure email notifications for the OpenSats grantee report submission system.

## Overview

The OpenSats report submission system sends confirmation emails to grantees when they submit progress reports. These emails include:
- Confirmation of successful submission
- Link to view the submitted report
- Project name and report number
- The full report content rendered in GitHub-style Markdown
- Contact information for support

## SendGrid Configuration

The system uses SendGrid for sending emails. To set up SendGrid:

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Add the API key to your environment variables:

```
SENDGRID_API_KEY=your_sendgrid_api_key
```

## Sender Authentication

SendGrid requires sender authentication before you can send emails:

1. In the SendGrid dashboard, navigate to **Settings** → **Sender Authentication**
2. Choose "Single Sender Verification" for quick setup
3. Create a new sender with:
   - From Name: "OpenSats Reports"
   - From Email: "support@opensats.org"
   - Company: "OpenSats"
   - Fill in the remaining required details
4. Verify the email address by clicking the link in the verification email

## Environment Variables

Configure the following environment variables:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SENDGRID_API_KEY` | Your SendGrid API key | `SG.xxxxxxxxxxxxxxxxxxxxxxx` | Yes |
| `EMAIL_FROM` | The sender email address | `support@opensats.org` | Yes |
| `FORCE_REAL_EMAILS` | Force sending real emails in development mode | `true` | No |

## Email Templates

The email templates are defined in `utils/email.ts`. The system sends:

1. **Report Confirmation Email**: Sent to grantees when they submit a progress report
   - Includes the full report content rendered in GitHub-style Markdown
   - Contains project name and report number
   - Provides contact information for support

## Error Handling and Retry Logic

The email system includes robust error handling and retry mechanisms:

1. **Retry Logic**: In production mode, the system will automatically retry sending emails up to 3 times with exponential backoff if a failure occurs.
2. **Error Logging**: Detailed error information is logged to help diagnose issues.
3. **Input Validation**: All email parameters are validated before sending.
4. **Fallbacks**: If email sending fails, appropriate error messages are returned to the user.

## Input Sanitization

All user input is sanitized before being used in emails or GitHub comments:

1. **Email Addresses**: Validated and normalized
2. **Markdown Content**: Sanitized to remove potentially harmful elements while preserving formatting
3. **Project Names and Report Numbers**: Trimmed and limited in length
4. **Grant IDs**: Validated to ensure they match the expected format (6-7 digit numbers)

## Testing Emails

To test email functionality in development:

1. Set up the environment variables with your SendGrid API key
2. Add `FORCE_REAL_EMAILS=true` to your `.env.local` file to send actual emails during development
3. Use test grant IDs (123456, 234567) to trigger the submission process
4. Check the logs for confirmation of email sending
5. Use the test script to send sample emails: `npx ts-node scripts/test-email.ts your-email@example.com`

For testing without sending actual emails, you can:
- Use a SendGrid sandbox environment
- Use a test email address that you control
- Check the server logs for the email content in development mode

## Troubleshooting

If emails are not being sent:

1. Check that `SENDGRID_API_KEY` is set correctly
2. Verify that the sender email (`support@opensats.org`) is verified in SendGrid
3. Check the server logs for any SendGrid API errors
4. Ensure the recipient email address is valid
5. Check SendGrid dashboard for delivery status and potential issues
6. Review the retry logs to see if multiple attempts were made

## Security Considerations

- Rotate the SendGrid API key periodically
- Use environment variables for all sensitive information
- Do not expose email addresses in public repositories
- Consider implementing email verification for grantees in the future
- All user input is sanitized to prevent injection attacks
