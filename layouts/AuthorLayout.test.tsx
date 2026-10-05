import { getAuthorSeoDescription } from './AuthorLayout'

describe('getAuthorSeoDescription', () => {
  it('uses board copy for current board members', () => {
    expect(
      getAuthorSeoDescription({
        name: 'Gigi',
        board: true,
      })
    ).toBe('Gigi serves on the OpenSats board.')
  })

  it('uses team copy for current team members', () => {
    expect(
      getAuthorSeoDescription({
        name: 'Tuma',
        content: true,
      })
    ).toBe('Tuma is part of the team at OpenSats.')
  })

  it('uses past-board copy for former board members', () => {
    expect(
      getAuthorSeoDescription({
        name: 'NVK',
        board: false,
      })
    ).toBe('NVK previously served on the OpenSats board.')
  })

  it('uses neutral copy for former contributors', () => {
    expect(
      getAuthorSeoDescription({
        name: 'Ville',
      })
    ).toBe('Ville has contributed to OpenSats.')
  })
})
