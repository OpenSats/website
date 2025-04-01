#!/bin/bash

# Create necessary directories
mkdir -p /Users/brytr/Documents/Windsurf/opensats/pages/reports
mkdir -p /Users/brytr/Documents/Windsurf/opensats/pages/api
mkdir -p /Users/brytr/Documents/Windsurf/opensats/components
mkdir -p /Users/brytr/Documents/Windsurf/opensats/lib
mkdir -p /Users/brytr/Documents/Windsurf/opensats/utils
mkdir -p /Users/brytr/Documents/Windsurf/opensats/types

# Copy files from the original PR branch
git show origin/feature/grantee-reports:components/GrantValidationForm.tsx > /Users/brytr/Documents/Windsurf/opensats/components/GrantValidationForm.tsx
git show origin/feature/grantee-reports:components/GranteeReportForm.tsx > /Users/brytr/Documents/Windsurf/opensats/components/GranteeReportForm.tsx
git show origin/feature/grantee-reports:components/ReportPreview.tsx > /Users/brytr/Documents/Windsurf/opensats/components/ReportPreview.tsx
git show origin/feature/grantee-reports:pages/api/report-bot.ts > /Users/brytr/Documents/Windsurf/opensats/pages/api/report-bot.ts
git show origin/feature/grantee-reports:pages/api/validate-grant.ts > /Users/brytr/Documents/Windsurf/opensats/pages/api/validate-grant.ts
git show origin/feature/grantee-reports:pages/api/submit-report.ts > /Users/brytr/Documents/Windsurf/opensats/pages/api/submit-report.ts
git show origin/feature/grantee-reports:pages/reports/submit.tsx > /Users/brytr/Documents/Windsurf/opensats/pages/reports/submit.tsx
git show origin/feature/grantee-reports:pages/reports/success.tsx > /Users/brytr/Documents/Windsurf/opensats/pages/reports/success.tsx
git show origin/feature/grantee-reports:lib/session.ts > /Users/brytr/Documents/Windsurf/opensats/lib/session.ts
git show origin/feature/grantee-reports:utils/email.ts > /Users/brytr/Documents/Windsurf/opensats/utils/email.ts
git show origin/feature/grantee-reports:utils/sanitize.ts > /Users/brytr/Documents/Windsurf/opensats/utils/sanitize.ts

# Copy type declaration files
git show origin/feature/grantee-reports:types/iron-session.d.ts > /Users/brytr/Documents/Windsurf/opensats/types/iron-session.d.ts 2>/dev/null || true
git show origin/feature/grantee-reports:types/crypto-js.d.ts > /Users/brytr/Documents/Windsurf/opensats/types/crypto-js.d.ts 2>/dev/null || true
git show origin/feature/grantee-reports:types/react-markdown.d.ts > /Users/brytr/Documents/Windsurf/opensats/types/react-markdown.d.ts 2>/dev/null || true

# Update .gitignore to exclude sensitive files
git show origin/feature/grantee-reports:.gitignore > /Users/brytr/Documents/Windsurf/opensats/.gitignore

echo "Files copied successfully!"
