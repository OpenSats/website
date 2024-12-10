import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { z } from 'zod'

import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { useFundSlug } from '../utils/use-fund-slug'
import Spinner from './Spinner'
import { env } from '../env.mjs'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  turnstileToken: z.string().min(1),
})

type LoginFormInputs = z.infer<typeof schema>

type Props = {
  close: () => void
  openPasswordResetModal: () => void
  openRegisterModal: () => void
}

function LoginFormModal({ close, openPasswordResetModal, openRegisterModal }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const fundSlug = useFundSlug()
  const turnstileRef = useRef<TurnstileInstance | null>()

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    shouldFocusError: false,
  })

  useEffect(() => {
    if (!fundSlug) return
    if (router.query.loginEmail) {
      form.setValue('email', router.query.loginEmail as string)
      setTimeout(() => form.setFocus('password'), 100)
      router.replace(`/${fundSlug}`)
    }
  }, [router.query.loginEmail])

  async function onSubmit(data: LoginFormInputs) {
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      turnstileToken: data.turnstileToken,
    })

    turnstileRef.current?.reset()

    if (result?.error) {
      if (result.error === 'INVALID_CREDENTIALS') {
        return form.setError(
          'password',
          { message: 'Invalid email or password.' },
          { shouldFocus: true }
        )
      }

      return toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }

    toast({
      title: 'Successfully logged in!',
    })

    close()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Login</DialogTitle>
        <DialogDescription>Log into your account.</DialogDescription>
      </DialogHeader>

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

          <div className="flex flex-col">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={() => (openPasswordResetModal(), close())}
              variant="link"
              className="self-end"
            >
              I forgot my password
            </Button>
          </div>

          <Turnstile
            ref={turnstileRef}
            siteKey={env.NEXT_PUBLIC_TURNSTILE_SITEKEY}
            onError={() => form.setValue('turnstileToken', '', { shouldValidate: true })}
            onExpire={() => form.setValue('turnstileToken', '', { shouldValidate: true })}
            onSuccess={(token) => form.setValue('turnstileToken', token, { shouldValidate: true })}
          />

          <div className="flex flex-row space-x-2">
            <Button
              className="grow basis-0"
              variant="outline"
              type="button"
              onClick={() => (openRegisterModal(), close())}
            >
              Register
            </Button>

            <Button
              className="grow basis-0"
              type="submit"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Spinner />} Login
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default LoginFormModal
