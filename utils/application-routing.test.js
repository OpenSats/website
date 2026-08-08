/** @jest-environment node */
/* eslint-env jest, node */

const {
  getApplicationIssueLabels,
  getApplicationRepo,
  normalizeMainFocus,
} = require('./application-routing.ts')

describe('application routing', () => {
  it('normalizes main focus values', () => {
    expect(normalizeMainFocus('Security')).toBe('security')
    expect(normalizeMainFocus(undefined)).toBe('')
  })

  it('labels regular security grant applications', () => {
    expect(
      getApplicationIssueLabels({
        main_focus: 'security',
        free_open_source: true,
        are_you_lead: true,
      })
    ).toEqual(['security'])
  })

  it('keeps security applications in the default applications repo', () => {
    expect(getApplicationRepo('applications', 'security')).toBe('applications')
  })

  it('routes known focus-specific applications to their repos', () => {
    expect(getApplicationRepo('applications', 'layer1')).toBe(
      'applications-layer1'
    )
    expect(getApplicationIssueLabels({ main_focus: 'layer2' })).toContain(
      'bitcoin'
    )
  })
})
