import Script from 'next/script'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const CALLBACK_NAME = '__opensatsTurnstileCallback'
const EXPIRED_CALLBACK_NAME = '__opensatsTurnstileExpired'
const ERROR_CALLBACK_NAME = '__opensatsTurnstileError'

declare global {
  interface Window {
    turnstile?: {
      reset: (widgetId?: string) => void
      ready?: (callback: () => void) => void
    }
    [CALLBACK_NAME]?: (token: string) => void
    [EXPIRED_CALLBACK_NAME]?: () => void
    [ERROR_CALLBACK_NAME]?: () => void
  }
}

export interface TurnstileWidgetHandle {
  getToken: () => string | undefined
  waitForToken: () => Promise<string>
  /** Clear the current token and ask Turnstile for a new challenge. */
  reset: () => void
  /** Reset, then resolve once a fresh token is available. */
  resetAndWaitForToken: () => Promise<string>
}

interface TurnstileWidgetProps {
  onTokenChange?: (token: string | undefined) => void
}

/**
 * Implicit-render Turnstile widget (Spin contract).
 * Uses api.js without `render=explicit` so Cloudflare auto-mounts
 * `.cf-turnstile` after the script loads — works with Next.js dynamic imports
 * where Script `onLoad` can miss.
 */
const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onTokenChange }, ref) {
    const tokenRef = useRef<string>()
    const waitersRef = useRef<Array<(token: string) => void>>([])
    const onTokenChangeRef = useRef(onTokenChange)
    onTokenChangeRef.current = onTokenChange

    const setToken = useCallback((token: string | undefined) => {
      tokenRef.current = token
      onTokenChangeRef.current?.(token)
      if (token) {
        const waiters = waitersRef.current
        waitersRef.current = []
        waiters.forEach((resolve) => resolve(token))
      }
    }, [])

    const waitForToken = useCallback(() => {
      if (tokenRef.current) return Promise.resolve(tokenRef.current)
      return new Promise<string>((resolve) => {
        waitersRef.current.push(resolve)
      })
    }, [])

    const reset = useCallback(() => {
      setToken(undefined)
      window.turnstile?.reset()
    }, [setToken])

    const resetAndWaitForToken = useCallback(() => {
      reset()
      return waitForToken()
    }, [reset, waitForToken])

    useImperativeHandle(
      ref,
      () => ({
        getToken: () => tokenRef.current,
        waitForToken,
        reset,
        resetAndWaitForToken,
      }),
      [reset, resetAndWaitForToken, waitForToken]
    )

    useEffect(() => {
      window[CALLBACK_NAME] = (token: string) => setToken(token)
      window[EXPIRED_CALLBACK_NAME] = () => setToken(undefined)
      window[ERROR_CALLBACK_NAME] = () => setToken(undefined)

      return () => {
        delete window[CALLBACK_NAME]
        delete window[EXPIRED_CALLBACK_NAME]
        delete window[ERROR_CALLBACK_NAME]
        setToken(undefined)
      }
    }, [setToken])

    if (!SITE_KEY) {
      return (
        <p className="text-sm text-red-600">
          Turnstile is not configured (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`).
        </p>
      )
    }

    return (
      <>
        <Script src={TURNSTILE_SCRIPT} strategy="afterInteractive" />
        <div
          className="cf-turnstile"
          data-sitekey={SITE_KEY}
          data-action="turnstile-spin-v2"
          data-callback={CALLBACK_NAME}
          data-expired-callback={EXPIRED_CALLBACK_NAME}
          data-error-callback={ERROR_CALLBACK_NAME}
        />
      </>
    )
  }
)

export default TurnstileWidget
