import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { trpc } from '../../utils/trpc'
import { useToast } from '../../components/ui/use-toast'

function VerifyEmail() {
  const router = useRouter()
  const { token } = router.query
  const { toast } = useToast()

  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation()

  useEffect(() => {
    ;(async () => {
      if (!token) return

      try {
        const result = await verifyEmailMutation.mutateAsync({
          token: token as string,
        })

        router.push(`/?loginEmail=${result.email}`)
        toast({ title: 'Email verified! You may now log in.' })
      } catch (error) {
        toast({ title: 'Invalid verification link.', variant: 'destructive' })
        router.push('/')
      }
    })()
  }, [token])

  return <></>
}

export default VerifyEmail
