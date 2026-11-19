import Script from 'next/script'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

const TURNSTILE_SCRIPT =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          action?: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          retry?: 'never'
          'error-callback'?: (code: string) => void
          'timeout-callback'?: () => void
          'unsupported-callback'?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
      ready?: (callback: () => void) => void
    }
  }
}

export interface TurnstileWidgetHandle {
  getToken: () => string | undefined
  waitForToken: () => Promise<string>
  /** Clear the current token and ask Turnstile for a new challenge. */
  reset: () => void
}

interface TurnstileWidgetProps {
  onTokenChange?: (token: string | undefined) => void
}

/**
 * Explicit-render Turnstile widget so remounting the last apply step
 * creates a fresh challenge (implicit render only mounts once).
 */
const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onTokenChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string>()
    const tokenRef = useRef<string>()
    const [failure, setFailure] = useState<string>()
    const timerRef = useRef<ReturnType<typeof setTimeout>>()
    const onTokenChangeRef = useRef(onTokenChange)
    onTokenChangeRef.current = onTokenChange

    const setToken = useCallback((token: string | undefined) => {
      tokenRef.current = token
      onTokenChangeRef.current?.(token)
      if (token) {
        clearTimeout(timerRef.current)
        setFailure(undefined)
      }
    }, [])

    const fail = useCallback(
      (message: string) => {
        clearTimeout(timerRef.current)
        setToken(undefined)
        setFailure(message)
      },
      [setToken]
    )

    const startTimer = useCallback(() => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        fail(
          'Verification is taking too long. Please retry or email your application.'
        )
      }, 60_000)
    }, [fail])

    const waitForToken = useCallback(() => {
      // Submit requires readiness. Handle expiry during validation promptly.
      if (tokenRef.current) return Promise.resolve(tokenRef.current)
      return Promise.reject(
        new Error('Please retry the bot verification challenge.')
      )
    }, [])

    const reset = useCallback(() => {
      setToken(undefined)
      setFailure(undefined)
      startTimer()
      if (widgetIdRef.current !== undefined && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
        } catch {
          fail('Verification could not restart. Please email your application.')
        }
      } else {
        fail(
          'Verification could not load. Save your application text before refreshing, or email your application.'
        )
      }
    }, [fail, setToken, startTimer])

    useImperativeHandle(
      ref,
      () => ({
        getToken: () => tokenRef.current,
        waitForToken,
        reset,
      }),
      [reset, waitForToken]
    )

    const mountWidget = useCallback(() => {
      if (!SITE_KEY || !containerRef.current || !window.turnstile) return
      if (widgetIdRef.current !== undefined) return

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          action: 'turnstile-spin-v2',
          retry: 'never',
          callback: setToken,
          'expired-callback': () => fail('Verification expired. Please retry.'),
          'error-callback': (code) =>
            fail(`Verification failed (code: ${code}). Please retry.`),
          'timeout-callback': () =>
            fail('Verification timed out. Please retry.'),
          'unsupported-callback': () =>
            fail(
              'This browser does not support verification. Please use another browser or email your application.'
            ),
        })
      } catch {
        fail('Verification could not start. Please email your application.')
      }
    }, [fail, setToken])

    useEffect(() => {
      if (!SITE_KEY) return

      startTimer()
      let cancelled = false

      const tryMount = () => {
        if (cancelled) return
        if (window.turnstile?.render) {
          mountWidget()
          return
        }
        window.turnstile?.ready?.(() => {
          if (!cancelled) mountWidget()
        })
      }

      tryMount()

      return () => {
        cancelled = true
        clearTimeout(timerRef.current)
        if (widgetIdRef.current !== undefined && window.turnstile?.remove) {
          window.turnstile.remove(widgetIdRef.current)
        }
        widgetIdRef.current = undefined
        setToken(undefined)
      }
    }, [mountWidget, setToken, startTimer])

    const message = SITE_KEY
      ? failure
      : 'Verification is currently unavailable.'

    return (
      <>
        {SITE_KEY && (
          <Script
            src={TURNSTILE_SCRIPT}
            strategy="afterInteractive"
            onReady={mountWidget}
            onError={() =>
              fail(
                'Verification could not load. Save your application text before refreshing, or email your application.'
              )
            }
          />
        )}
        <div ref={containerRef} />
        {message && (
          <div role="alert" className="mt-4 space-y-3 text-sm">
            <p>{message}</p>
            {SITE_KEY && (
              <button
                type="button"
                onClick={reset}
                className="rounded border px-4 py-2"
              >
                Retry verification
              </button>
            )}
            <p>
              Your entries are still in this form. If verification keeps
              failing, email your application to{' '}
              <a href="mailto:applications@opensats.org" className="underline">
                applications@opensats.org
              </a>
              . Include the error code, if shown, and your browser name and
              version.
            </p>
          </div>
        )}
      </>
    )
  }
)

export default TurnstileWidget
