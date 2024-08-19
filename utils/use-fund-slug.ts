import { useRouter } from 'next/router'
import { FundSlug } from '@prisma/client'

import { getFundSlugFromUrlPath } from './funds'

export function useFundSlug() {
  const router = useRouter()
  return getFundSlugFromUrlPath(router.asPath)
}
