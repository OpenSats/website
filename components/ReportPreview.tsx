import React from 'react'
import ReactMarkdown from 'react-markdown'

interface ReportPreviewProps {
  project_name: string
  report_number: string
  time_spent: string
  next_quarter: string
  money_usage: string
  help_needed?: string
}

export default function ReportPreview({
  project_name,
  report_number,
  time_spent,
  next_quarter,
  money_usage,
  help_needed,
}: ReportPreviewProps) {
  const markdown = `
# Progress Report # ${report_number} for ${project_name}

## Time Spent & Progress Made
${time_spent}

## Plans for Next Quarter
${next_quarter}

## Use of Funds
${money_usage}
${help_needed ? `\n## Help or Support Needed\n${help_needed}` : ''}
`

  return <ReactMarkdown>{markdown}</ReactMarkdown>
}
