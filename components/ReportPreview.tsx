import React from 'react'
import ReactMarkdown from 'react-markdown'

interface ReportPreviewProps {
  data: {
    project_name: string
    report_number: string
    time_spent: string
    next_quarter: string
    money_usage: string
    help_needed?: string
  }
}

// This function mirrors the formatReport function in submit-report.ts
// to ensure consistency between preview and submission
const formatReportContent = (data: ReportPreviewProps['data']): string => {
  const {
    project_name,
    report_number,
    time_spent,
    next_quarter,
    money_usage,
    help_needed,
  } = data

  const sections = [
    `# Progress Report # ${report_number} for ${project_name}`,
    '',
    '## Project Updates',
    time_spent || '*No content provided*',
    '',
    '## Plans for Next Quarter',
    next_quarter || '*No content provided*',
    '',
    '## Use of Funds',
    money_usage || '*No content provided*',
  ]

  // Only include Support needed section if it's filled in
  if (help_needed && help_needed.trim()) {
    sections.push('', '## Support needed', help_needed)
  }

  return sections.join('\n')
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  // Generate the report content using the same format as the API
  const reportContent = formatReportContent(data)

  return (
    <div className="prose prose-sm max-w-none p-6 text-white dark:prose-invert">
      <div className="text-white [&>*]:text-white [&_code]:text-white [&_em]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_li]:text-white [&_p]:text-white [&_strong]:text-white">
        <ReactMarkdown>{reportContent}</ReactMarkdown>
      </div>
    </div>
  )
}

export default ReportPreview
