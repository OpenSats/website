import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReloadIcon } from '@radix-ui/react-icons'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginFormInputs = z.infer<typeof schema>

type Props = { close: () => void; openPasswordResetModal: () => void }

function LoginFormModal({ close, openPasswordResetModal }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    shouldFocusError: false,
  })

  useEffect(() => {
    if (router.query.loginEmail) {
      form.setValue('email', router.query.loginEmail as string)
      setTimeout(() => form.setFocus('password'), 100)
      router.replace('/')
    }
  }, [router.query.loginEmail])

  async function onSubmit(data: LoginFormInputs) {
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    })

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

  function onIForgotMyPassword() {
    close()
    openPasswordResetModal()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Login</DialogTitle>
        <DialogDescription>Log into your account.</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
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
              onClick={onIForgotMyPassword}
              variant="link"
              className="self-end"
            >
              I forgot my password
            </Button>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            )}{' '}
            Login
          </Button>
        </form>
      </Form>
    </>
  )
}

export default LoginFormModal
