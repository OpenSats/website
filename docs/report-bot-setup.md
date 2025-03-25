# OpenSats Report Bot Setup

This document explains how to set up and use the OpenSats Report Bot for grantee report submissions.

## Overview

The OpenSats Report Bot is a GitHub account that posts grantee progress reports as comments on issues in the OpenSats/reports repository. This provides a clean separation between personal GitHub accounts and automated system actions.

## Setup Instructions

### 1. Bot Account Configuration

The bot account has already been created with the following details:
- Username: opensats-report-bot
- Email: support@opensats.org (or your designated support email)

### 2. Token Configuration

To use the bot for posting reports, add the following to your environment variables:

```
GH_BOT_TOKEN=your_bot_personal_access_token
```

The system will automatically use this token when available, falling back to the regular `GH_ACCESS_TOKEN` if the bot token is not configured.

### 3. Repository Access

The bot account needs to be added as a collaborator to the OpenSats/reports repository with Write access. This requires admin access to the repository.

## Development Testing

When testing in development mode:
- The system will log which token is being used (bot or regular)
- Test grant IDs (123456, 234567) will work without actual GitHub API calls
- For real GitHub testing, grant ID 887414 will use issue #231

## Troubleshooting

If reports are not being posted by the bot:

1. Check that the `GH_BOT_TOKEN` environment variable is set correctly
2. Verify that the bot has been added as a collaborator to the repository
3. Check the server logs for any authentication errors
4. Ensure the token has not expired (GitHub PATs can expire)

## Security Considerations

- Rotate the bot's Personal Access Token periodically (recommended: every 90-180 days)
- Use a token with the minimum required permissions (issues:write, metadata:read)
- Store the token securely in environment variables, never in code
