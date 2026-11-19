/* eslint-env jest */
import React, { createRef } from 'react'
import { act, fireEvent, render, screen, cleanup } from '@testing-library/react'

let mockScriptProps
jest.mock('next/script', () => ({
  __esModule: true,
  default: (props) => {
    mockScriptProps = props
    return null
  },
}))

process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
const TurnstileWidget = require('./TurnstileWidget').default

let options
beforeEach(() => {
  jest.useFakeTimers()
  window.turnstile = {
    render: jest.fn((element, config) => {
      options = config
      return 'widget-1'
    }),
    reset: jest.fn(),
    remove: jest.fn(),
  }
})
afterEach(() => {
  cleanup()
  jest.useRealTimers()
  delete window.turnstile
})

it('exposes an error code and email fallback before submission, then recovers on retry', () => {
  const onTokenChange = jest.fn()
  render(<TurnstileWidget onTokenChange={onTokenChange} />)
  expect(options.retry).toBe('never')
  act(() => options['error-callback']('300030'))
  expect(screen.getByRole('alert')).toHaveTextContent('300030')
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    'mailto:applications@opensats.org'
  )
  expect(onTokenChange).toHaveBeenLastCalledWith(undefined)
  fireEvent.click(screen.getByRole('button', { name: 'Retry verification' }))
  expect(window.turnstile.reset).toHaveBeenCalledTimes(1)
  act(() => options.callback('fresh-token'))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(onTokenChange).toHaveBeenLastCalledWith('fresh-token')
  act(() => jest.advanceTimersByTime(60000))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it.each([
  ['expired-callback', 'expired'],
  ['timeout-callback', 'timed out'],
  ['unsupported-callback', 'does not support'],
])('handles %s without leaving a valid token', async (callback, message) => {
  const ref = createRef()
  render(<TurnstileWidget ref={ref} />)
  act(() => options.callback('token'))
  await expect(ref.current.waitForToken()).resolves.toBe('token')
  act(() => options[callback]())
  expect(screen.getByRole('alert')).toHaveTextContent(message)
  await expect(ref.current.waitForToken()).rejects.toThrow('retry')
})

it('offers a fallback for a challenge that never finishes', () => {
  render(<TurnstileWidget />)
  act(() => jest.advanceTimersByTime(60000))
  expect(screen.getByRole('alert')).toHaveTextContent('taking too long')
})

it('reports script load failure and does not leave a hanging token promise', async () => {
  delete window.turnstile
  const ref = createRef()
  render(<TurnstileWidget ref={ref} />)
  act(() => mockScriptProps.onError())
  expect(screen.getByRole('alert')).toHaveTextContent('could not load')
  await expect(ref.current.waitForToken()).rejects.toThrow('retry')
})

it('mounts when a late script becomes ready and remounts after leaving the step', () => {
  const api = window.turnstile
  delete window.turnstile
  const first = render(<TurnstileWidget />)
  window.turnstile = api
  act(() => mockScriptProps.onReady())
  expect(api.render).toHaveBeenCalledTimes(1)
  act(() => mockScriptProps.onReady())
  expect(api.render).toHaveBeenCalledTimes(1)
  first.unmount()
  expect(api.remove).toHaveBeenCalledWith('widget-1')
  render(<TurnstileWidget />)
  expect(api.render).toHaveBeenCalledTimes(2)
})

it('cleans up the watchdog on unmount', () => {
  const view = render(<TurnstileWidget />)
  view.unmount()
  expect(jest.getTimerCount()).toBe(0)
})
