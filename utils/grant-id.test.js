/** @jest-environment node */
/* eslint-env jest, node */

const {
  GRANT_ID_PATTERN,
  isNumericGrantId,
  normalizeGrantId,
  parseGrantIdInput,
  projectNameFromTitle,
  titleMatchesGrantId,
} = require('./grant-id.ts')

const { ERROR_MESSAGES } = require('./constants.ts')

describe('grant id helpers', () => {
  it('accepts 6 or 7 digit ids', () => {
    expect(isNumericGrantId('123456')).toBe(true)
    expect(isNumericGrantId('1234567')).toBe(true)
    expect(GRANT_ID_PATTERN.test('123456')).toBe(true)
  })

  it('rejects non-numeric and wrong-length ids', () => {
    expect(isNumericGrantId('')).toBe(false)
    expect(isNumericGrantId('cashu')).toBe(false)
    expect(isNumericGrantId('12345')).toBe(false)
    expect(isNumericGrantId('12345678')).toBe(false)
    expect(isNumericGrantId('123456-1')).toBe(false)
  })

  it('trims incoming values', () => {
    expect(normalizeGrantId(' 946366 ')).toBe('946366')
    expect(normalizeGrantId(946366)).toBe('946366')
    expect(normalizeGrantId(undefined)).toBe('')
  })

  it('parses grant ids for the API', () => {
    expect(parseGrantIdInput(' 946366 ')).toEqual({
      ok: true,
      grantId: '946366',
    })
    expect(parseGrantIdInput('')).toEqual({
      ok: false,
      error: ERROR_MESSAGES.GRANT_ID_REQUIRED,
    })
    expect(parseGrantIdInput('cashu')).toEqual({
      ok: false,
      error: ERROR_MESSAGES.GRANT_ID_INVALID,
    })
  })

  it('strips grant prefixes from issue titles', () => {
    expect(projectNameFromTitle('Grant #12: Cashu-TS by Alice')).toBe('Cashu-TS')
    expect(projectNameFromTitle('946366 - Cashu-TS and Cashu.me')).toBe(
      '946366 - Cashu-TS and Cashu.me'
    )
  })

  it('matches a grant id as a whole number in the title', () => {
    expect(titleMatchesGrantId('946366 - Cashu-TS and Cashu.me', '946366')).toBe(
      true
    )
    expect(titleMatchesGrantId('Grant #946366: Cashu-TS', '946366')).toBe(true)
    expect(titleMatchesGrantId('Project by 946366', '946366')).toBe(true)
  })

  it('does not match a substring or a body-only mention', () => {
    expect(titleMatchesGrantId('19463661 - Other project', '946366')).toBe(
      false
    )
    expect(titleMatchesGrantId('94636 - Short id', '946366')).toBe(false)
    expect(titleMatchesGrantId('Some project', '946366')).toBe(false)
    expect(titleMatchesGrantId(null, '946366')).toBe(false)
    expect(titleMatchesGrantId('946366 - Cashu', 'cashu')).toBe(false)
  })
})
