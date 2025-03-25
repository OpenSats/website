import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ReportPreviewProps {
  data: {
    project_name: string;
    report_number: string;
    time_spent: string;
    next_quarter: string;
    money_usage: string;
    help_needed?: string;
  };
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  const { project_name, report_number, time_spent, next_quarter, money_usage, help_needed } = data
  
  // Format the report content
  const reportContent = [
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
    reportContent.push(
      '',
      '## Support needed',
      help_needed
    )
  }

  // We'll keep the bot signature in the backend but not show it in the preview
  // The signature will be added in submit-report.ts

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert p-6">
      <div className="prose-headings:text-white">
        <ReactMarkdown>
          {reportContent.join('\n')}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default ReportPreview;
