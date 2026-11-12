/** @jest-environment node */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseScores, refreshHumanWritingScores } from './humanWritingScores'

let directory: string
let file: string
beforeEach(() => {
  directory = mkdtempSync(path.join(os.tmpdir(), 'human-writing-'))
  file = path.join(directory, 'scores.json')
  writeFileSync(
    file,
    JSON.stringify({ version: 1, scores: { 'blog/stale': 100 } })
  )
})
afterEach(() => {
  jest.useRealTimers()
  rmSync(directory, { recursive: true, force: true })
})

const response = (data: unknown) =>
  ({ ok: true, json: async () => data } as Response)

it('replaces old scores with current, unrounded blog and newsletter scores', async () => {
  const scores = { 'blog/example': 94.999999, 'newsletter/example': 95 }
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(response({ version: 1, scores }))
  expect(await refreshHumanWritingScores({ file, fetchImpl })).toBe(2)
  expect(JSON.parse(readFileSync(file, 'utf8'))).toEqual({ version: 1, scores })
  expect(fetchImpl).toHaveBeenCalledTimes(1)
})

it.each([
  ['HTTP error', () => Promise.resolve({ ok: false, status: 503 })],
  ['network error', () => Promise.reject(new Error('network unavailable'))],
  [
    'invalid JSON',
    () =>
      Promise.resolve({
        ok: true,
        json: async () => {
          throw new Error('invalid JSON')
        },
      }),
  ],
  [
    'invalid schema',
    () => Promise.resolve(response({ version: 2, scores: {} })),
  ],
  [
    'invalid score',
    () =>
      Promise.resolve(
        response({ version: 1, scores: { 'blog/example': 101 } })
      ),
  ],
])('warns, succeeds, and discards stale scores on %s', async (_, handler) => {
  const warn = jest.fn()
  expect(
    await refreshHumanWritingScores({
      file,
      fetchImpl: handler as typeof fetch,
      warn,
    })
  ).toBe(0)
  expect(JSON.parse(readFileSync(file, 'utf8'))).toEqual({
    version: 1,
    scores: {},
  })
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('building without article badges')
  )
})

it('aborts after ten seconds and continues without stale scores', async () => {
  jest.useFakeTimers()
  const fetchImpl = jest.fn(
    (_, options) =>
      new Promise((_, reject) => {
        options.signal.addEventListener('abort', () =>
          reject(new Error('aborted'))
        )
      })
  ) as jest.Mock
  const warn = jest.fn()
  const pending = refreshHumanWritingScores({ file, fetchImpl, warn })
  await jest.advanceTimersByTimeAsync(10000)
  expect(await pending).toBe(0)
  expect(warn).toHaveBeenCalled()
  expect(JSON.parse(readFileSync(file, 'utf8')).scores).toEqual({})
})

it('accepts an empty response without preserving a previous result', async () => {
  const warn = jest.fn()
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(response({ version: 1, scores: {} }))
  expect(await refreshHumanWritingScores({ file, fetchImpl, warn })).toBe(0)
  expect(warn).not.toHaveBeenCalled()
  expect(JSON.parse(readFileSync(file, 'utf8')).scores).toEqual({})
})

it.each([
  null,
  [],
  {},
  { version: 1, scores: [] },
  { version: 1, scores: { 'blog/example': '100' } },
])('rejects malformed score payload %s', (payload) =>
  expect(() => parseScores(payload)).toThrow()
)
