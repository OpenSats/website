import React from 'react'

interface ReportPreviewProps {
  data: {
    reportNumber?: string
    reportDate?: string
    projectName?: string
    grantId?: string
    issueNumber?: number
    reportContent?: string
    [key: string]: any
  }
}

/**
 * Format a date string or Date object to a readable format
 */
function formatDate(date: string | Date | undefined): string {
  if (!date) {
    date = new Date();
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format: Month Day, Year (e.g., January 1, 2023)
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * A component to preview the report before submission
 */
const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  const {
    reportNumber,
    reportDate,
    projectName,
    grantId,
    reportContent,
  } = data

  const formattedDate = formatDate(reportDate);

  return (
    <div className="markdown-body p-6 text-gray-200">
      <div className="mb-6 border-b border-gray-700 pb-4">
        <h1 className="mb-2 text-2xl font-bold text-white">
          {projectName || 'Project'} - Progress Report #{reportNumber || '1'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <div>
            <span className="font-medium">Date:</span> {formattedDate}
          </div>
          {grantId && (
            <div>
              <span className="font-medium">Grant ID:</span> {grantId}
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        {reportContent ? (
          <div className="whitespace-pre-wrap">{reportContent}</div>
        ) : (
          <p className="text-gray-400">No report content provided.</p>
        )}
      </div>
    </div>
  )
}

export default ReportPreview
