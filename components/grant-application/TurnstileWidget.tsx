import Script from 'next/script'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
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
          'error-callback'?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

export interface TurnstileWidgetHandle {
  getToken: () => string | undefined
  waitForToken: () => Promise<string>
  reset: () => Promise<string>
}

interface TurnstileWidgetProps {
  onTokenChange?: (token: string | undefined) => void
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onTokenChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string>()
    const tokenRef = useRef<string>()
    const waitersRef = useRef<Array<(token: string) => void>>([])
    const [scriptReady, setScriptReady] = useState(false)

    const setToken = useCallback(
      (token: string | undefined) => {
        tokenRef.current = token
        onTokenChange?.(token)
        if (token) {
          const waiters = waitersRef.current
          waitersRef.current = []
          waiters.forEach((resolve) => resolve(token))
        }
      },
      [onTokenChange]
    )

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
      return waitForToken()
    }, [setToken, waitForToken])

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
      if (
        !scriptReady ||
        !SITE_KEY ||
        !containerRef.current ||
        !window.turnstile
      ) {
        return
      }
      if (widgetIdRef.current) return

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        action: 'turnstile-spin-v2',
        callback: (token) => setToken(token),
        'expired-callback': () => setToken(undefined),
        'error-callback': () => setToken(undefined),
      })

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = undefined
        }
      }
    }, [scriptReady, setToken])

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
          src={`${TURNSTILE_SCRIPT}?render=explicit`}
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />
        <div
          ref={containerRef}
          className="cf-turnstile"
          data-sitekey={SITE_KEY}
          data-action="turnstile-spin-v2"
        />
      </>
    )
  }
)

export default TurnstileWidget
