import { useRouter } from 'next/router'

import { getFundSlugFromUrlPath } from './funds'

export function useFundSlug() {
  const router = useRouter()
  return getFundSlugFromUrlPath(router.asPath)
}
