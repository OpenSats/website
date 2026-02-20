import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as Fathom from 'fathom-client'

export function FathomAnalytics() {
  const router = useRouter()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FATHOM_ID) return

    try {
      Fathom.load(process.env.NEXT_PUBLIC_FATHOM_ID, {
        includedDomains: ['opensats.org'],
      })
    } catch (e) {
      console.warn('Fathom failed to load:', e)
    }

    function onRouteChangeComplete() {
      try {
        Fathom.trackPageview()
      } catch (e) {
        console.warn('Fathom pageview tracking failed:', e)
      }
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return null
}
