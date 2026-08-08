/** @jest-environment node */
/* eslint-env jest, node */

const { isSpamSubmission } = require('./spam-helpers.ts')

describe('isSpamSubmission', () => {
  it('does not reject a legitimate organization website field', () => {
    expect(
      isSpamSubmission({
        organization_website: 'https://example.org',
        formElapsedMs: 60000,
      })
    ).toBe(false)
  })

  it('does not compare the legacy client timestamp with the server clock', () => {
    expect(
      isSpamSubmission({
        formLoadedAt: Date.now() + 60000,
        formElapsedMs: 60000,
      })
    ).toBe(false)
  })

  it('rejects a filled dedicated honeypot', () => {
    expect(
      isSpamSubmission({ company_fax: '+1 555 555 5555', formElapsedMs: 60000 })
    ).toBe(true)
    expect(isSpamSubmission({ company_fax: 5555555 })).toBe(true)
  })

  it('rejects a submission completed in under ten seconds', () => {
    expect(isSpamSubmission({ formElapsedMs: 9999 })).toBe(true)
  })

  it('accepts elapsed time at the threshold', () => {
    expect(isSpamSubmission({ formElapsedMs: 10000 })).toBe(false)
  })

  it('does not reject invalid or negative timing values', () => {
    expect(isSpamSubmission({ formElapsedMs: -1 })).toBe(false)
    expect(isSpamSubmission({ formElapsedMs: Number.NaN })).toBe(false)
  })
})
