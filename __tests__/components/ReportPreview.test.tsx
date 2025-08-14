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
    const reportContent = `# Progress Report # 1

## Use of Funds
Test usage

## Progress Made
Test progress

## Plans for Next Quarter
Test plans

## Help Needed
Test help`

    const { getByTestId } = render(
      <ReportPreview reportContent={reportContent} />
    )

    const content = getByTestId('markdown-content').textContent || ''
    
    // Just verify the key elements we care about
    expect(content).toContain('Progress Report # 1')
    expect(content).toContain('Use of Funds')
  })
}) 