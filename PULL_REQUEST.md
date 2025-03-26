# Grantee Report Submission System

## Overview

This pull request implements a complete report submission system for OpenSats grantees. The system allows grantees to validate their grant numbers, submit progress reports, and receive confirmation emails with a copy of their submitted reports.

## Key Features

### 1. Grantee Report Submission Flow

- **Two-Step Process**: Grant validation followed by report submission
- **Grant Validation**: Verifies grant IDs (6-7 digit numbers) against GitHub issues
- **Report Form**: Collects project updates, plans for next quarter, and use of funds
- **Report Preview**: Allows grantees to preview their report before submission

### 2. Email Notifications

- **Confirmation Emails**: Sends a confirmation email to grantees when they submit a report
- **Report Copy**: Includes a full copy of the submitted report in the email
- **SendGrid Integration**: Uses SendGrid API for reliable email delivery
- **OpenSats Branding**: Emails match OpenSats branding with orange header

### 3. GitHub Integration

- **Issue Comments**: Submits reports as comments on the corresponding grant issue
- **Markdown Formatting**: Formats reports in Markdown for readability
- **Grant Verification**: Uses GitHub API to verify grant numbers

### 4. Development and Testing Support

- **Test Mode**: Automatically enables test mode in non-production environments
- **Test Grant IDs**: Supports test grant IDs (123456, 234567) in development
- **Email Testing**: Includes a test script for verifying email functionality

## Files Changed

- **API Routes**: Implemented report submission and grant validation endpoints
- **UI Components**: Created report form and preview components
- **Email Utilities**: Built email sending functionality with SendGrid integration
- **Documentation**: Added comprehensive setup and testing guides

## Testing

The system has been thoroughly tested in development mode:

1. **Grant Validation**: Verified that valid grant IDs are properly recognized
2. **Report Submission**: Confirmed that reports are correctly formatted and submitted
3. **Email Delivery**: Tested that confirmation emails are sent with report content
4. **Error Handling**: Verified that the system handles errors gracefully

## Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key for email sending |
| `EMAIL_FROM` | Sender email address (support@opensats.org) |
| `GH_ACCESS_TOKEN` | GitHub access token for API interactions |
| `GH_ORG` | GitHub organization (OpenSats) |
| `GH_REPORTS_REPO` | GitHub repository for reports (reports) |

## Next Steps

After merging this PR, the following steps are recommended:

1. **User Testing**: Conduct testing with actual grantees
2. **Documentation**: Create user-facing documentation for grantees
3. **Monitoring**: Set up monitoring for the report submission process
