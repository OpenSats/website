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
# Progress Report #${report_number} for ${project_name}

## Time Spent & Progress Made
${time_spent}

## Plans for Next Quarter
${next_quarter}

## Use of Funds
${money_usage}
${help_needed ? `\n## Help or Support Needed\n${help_needed}` : ''}
`

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none p-6 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-orange-500 hover:prose-a:text-orange-600 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:text-gray-800 dark:prose-pre:text-gray-200 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:border-orange-500">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  )
}
