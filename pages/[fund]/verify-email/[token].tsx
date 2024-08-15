import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { trpc } from '../../../utils/trpc'
import { useToast } from '../../../components/ui/use-toast'
import { useFundSlug } from '../../../utils/use-fund-slug'

function VerifyEmail() {
  const router = useRouter()
  const { token } = router.query
  const { toast } = useToast()
  const fundSlug = useFundSlug()

  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation()

  useEffect(() => {
    ;(async () => {
      if (!token) return

      try {
        const result = await verifyEmailMutation.mutateAsync({
          token: token as string,
        })

        router.push(`/${fundSlug}/?loginEmail=${result.email}`)
        toast({ title: 'Email verified! You may now log in.' })
      } catch (error) {
        toast({ title: 'Invalid verification link.', variant: 'destructive' })
        router.push(`/${fundSlug}`)
      }
    })()
  }, [token])

  return <></>
}

export default VerifyEmail
