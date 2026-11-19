import Script from 'next/script'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

const TURNSTILE_SCRIPT =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const CALLBACK_NAME = '__opensatsTurnstileCallback'
const EXPIRED_CALLBACK_NAME = '__opensatsTurnstileExpired'
const ERROR_CALLBACK_NAME = '__opensatsTurnstileError'

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
          'error-callback'?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
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
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    }, [setToken])

    useImperativeHandle(
      ref,
      () => ({
        getToken: () => tokenRef.current,
        waitForToken,
        reset,
      }),
      [reset, waitForToken]
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

    const mountWidget = useCallback(() => {
      if (!SITE_KEY || !containerRef.current || !window.turnstile) return
      if (widgetIdRef.current) return

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        action: 'turnstile-spin-v2',
        callback: (token: string) => window[CALLBACK_NAME]?.(token),
        'expired-callback': () => window[EXPIRED_CALLBACK_NAME]?.(),
        'error-callback': () => window[ERROR_CALLBACK_NAME]?.(),
      })
    }, [])

    useEffect(() => {
      if (!SITE_KEY) return

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
        if (widgetIdRef.current && window.turnstile?.remove) {
          window.turnstile.remove(widgetIdRef.current)
        }
        widgetIdRef.current = undefined
        setToken(undefined)
      }
    }, [mountWidget, setToken])

    if (!SITE_KEY) {
      return (
        <p className="text-sm text-red-600">
          Turnstile is not configured (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`).
        </p>
      )
    }

    return (
      <>
        <Script
          src={TURNSTILE_SCRIPT}
          strategy="afterInteractive"
          onLoad={mountWidget}
        />
        <div ref={containerRef} />
      </>
    )
  }
)

export default TurnstileWidget
