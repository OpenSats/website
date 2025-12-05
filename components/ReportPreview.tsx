import React from 'react'
import ReactMarkdown from 'react-markdown'

interface ReportPreviewProps {
  reportContent: string
}

export default function ReportPreview({ reportContent }: ReportPreviewProps) {
  return (
    <div className="prose prose-sm max-w-none p-6 dark:prose-dark">
      <ReactMarkdown>{reportContent}</ReactMarkdown>
    </div>
  )
}
