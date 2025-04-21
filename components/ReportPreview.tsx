import React from 'react'
import ReactMarkdown from 'react-markdown'

interface ReportPreviewProps {
  project_name: string
  time_spent: string
  next_quarter: string
  money_usage: string
  help_needed?: string
}

export default function ReportPreview({
  project_name,
  time_spent,
  next_quarter,
  money_usage,
  help_needed,
}: ReportPreviewProps) {
  const markdown = `# ${project_name} Progress Report

## Project Updates
${time_spent}

## Plans for Next Quarter
${next_quarter}

## Use of Funds
${money_usage}
${
  help_needed
    ? `
## Support Needed
${help_needed}`
    : ''
}`

  return (
    <div className="prose prose-orange mx-auto max-w-none p-6 dark:prose-invert">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  )
}
