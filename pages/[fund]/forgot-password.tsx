import { useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { useForm } from 'react-hook-form'
import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { Input } from '../../components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Button } from '../../components/ui/button'
import { useToast } from '../../components/ui/use-toast'
import { trpc } from '../../utils/trpc'
import Spinner from '../../components/Spinner'
import { env } from '../../env.mjs'
import { authOptions } from '../api/auth/[...nextauth]'

const schema = z.object({
  turnstileToken: z.string().min(1),
  email: z.string().email(),
})

type PasswordResetFormInputs = z.infer<typeof schema>

function ForgotPassword() {
  const { toast } = useToast()
  const turnstileRef = useRef<TurnstileInstance | null>()

  const form = useForm<PasswordResetFormInputs>({ resolver: zodResolver(schema) })

  const requestPasswordResetMutation = trpc.auth.requestPasswordReset.useMutation()

  async function onSubmit(data: PasswordResetFormInputs) {
    try {
      await requestPasswordResetMutation.mutateAsync(data)

      toast({ title: 'Success', description: 'A password reset link has been sent to your email.' })
      form.reset({ email: '' })
    } catch (error) {
      toast({ title: 'Error', description: 'Sorry, something went wrong.', variant: 'destructive' })
    }

    turnstileRef.current?.reset()
  }

  return (
    <div className="w-full max-w-xl m-auto p-6 flex flex-col space-y-4 bg-white rounded-lg">
      <h1 className="font-bold">Request password reset</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Turnstile
            ref={turnstileRef}
            siteKey={env.NEXT_PUBLIC_TURNSTILE_SITEKEY}
            onError={() => form.setValue('turnstileToken', '', { shouldValidate: true })}
            onExpire={() => form.setValue('turnstileToken', '', { shouldValidate: true })}
            onSuccess={(token) => form.setValue('turnstileToken', token, { shouldValidate: true })}
          />

          <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Spinner />} Reset Password
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default ForgotPassword

export async function getServerSideProps({ params, req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, authOptions)

  if (session) {
    return { redirect: { destination: `/${params?.fund!}` } }
  }

  return { props: {} }
}
