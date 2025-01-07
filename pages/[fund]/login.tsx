import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { getServerSession } from 'next-auth'
import { GetServerSidePropsContext } from 'next'
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
import { useFundSlug } from '../../utils/use-fund-slug'
import Spinner from '../../components/Spinner'
import { env } from '../../env.mjs'
import { authOptions } from '../api/auth/[...nextauth]'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  turnstileToken: z.string().min(1),
})

type LoginFormInputs = z.infer<typeof schema>

function Login() {
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
    if (router.query.email) {
      form.setValue('email', router.query.email as string)
      setTimeout(() => form.setFocus('password'), 100)
    }
  }, [router.query.email])

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

      toast({ title: 'Error', description: 'Sorry, something went wrong.', variant: 'destructive' })
    }

    toast({
      title: 'Success',
      description: 'Successfully logged in!',
    })

    if (router.query.nextAction === 'membership') {
      router.push(`/${fundSlug}/membership`)
    } else {
      router.push(`/${fundSlug}`)
    }
  }

  return (
    <div className="w-full max-w-xl m-auto p-6 flex flex-col space-y-4 bg-white rounded-lg">
      <h1 className="font-bold">Login</h1>

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
              onClick={() => router.push(`/${fundSlug}/forgot-password`)}
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
              onClick={() => router.push(`/${fundSlug}/register`)}
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
    </div>
  )
}

export default Login

export async function getServerSideProps({ params, req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, authOptions)

  if (session) {
    return { redirect: { destination: `/${params?.fund!}` } }
  }
}
