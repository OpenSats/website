import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { load, trackPageview } from 'fathom-client'

const FATHOM_SITE_ID = process.env.NEXT_PUBLIC_FATHOM_ID || 'UQPWIILQ'

export default function FathomAnalytics() {
  const router = useRouter()

  useEffect(() => {
    if (!FATHOM_SITE_ID) return

    load(FATHOM_SITE_ID, {
      auto: false,
    })
  }, [])

  useEffect(() => {
    if (!FATHOM_SITE_ID) return

    const onRouteChangeComplete = () => {
      trackPageview()
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return null
}
