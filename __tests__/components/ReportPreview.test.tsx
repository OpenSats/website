import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock ReactMarkdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown(props: { children: string }) {
    return <div data-testid="markdown-content">{props.children}</div>
  }
})

import ReportPreview from '../../components/ReportPreview'

describe('ReportPreview', () => {
  it('renders with correct content', () => {
    const { getByTestId } = render(
      <ReportPreview
        project_name="Test Project"
        report_number="1"
        time_spent="test progress"
        next_quarter="test plans"
        money_usage="test usage"
        help_needed="test help"
      />
    )

    const content = getByTestId('markdown-content').textContent || ''
    
    // Just verify the key elements we care about
    expect(content).toContain('Progress Report # 1')
    expect(content).toContain('Use of Funds')
  })
}) 