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
  const reportContent = `
# Progress Report # ${report_number} for ${project_name}

## Time Spent & Progress Made
${time_spent}

## Plans for Next Quarter
${next_quarter}

## Use of Funds
${money_usage}

${help_needed ? `## Help or Support Needed\n${help_needed}` : ''}
`

  return (
    <div className="prose prose-invert mx-auto text-gray-100 prose-headings:text-gray-100">
      <ReactMarkdown>{reportContent}</ReactMarkdown>
    </div>
  )
}
