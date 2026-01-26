import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as Fathom from 'fathom-client'

export function FathomAnalytics() {
  const router = useRouter()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FATHOM_ID) return

    Fathom.load(process.env.NEXT_PUBLIC_FATHOM_ID, {
      includedDomains: ['opensats.org'],
    })

    function onRouteChangeComplete() {
      Fathom.trackPageview()
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return null
}
