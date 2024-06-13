import { useForm } from 'react-hook-form'
import { ReloadIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { jwtDecode } from 'jwt-decode'
import { z } from 'zod'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { toast } from '../../components/ui/use-toast'
import { useEffect } from 'react'
import { trpc } from '../../utils/trpc'
import { cn } from '../../utils/cn'

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type ResetPasswordFormInputs = z.infer<typeof schema>

function ResetPassword() {
  const router = useRouter()

  const form = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(schema),
  })

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation()

  async function onSubmit(data: ResetPasswordFormInputs) {
    const { token } = router.query

    if (!token) return

    try {
      await resetPasswordMutation.mutateAsync({
        token: token as string,
        password: data.password,
      })

      toast({ title: 'Password successfully reset. You may now log in.' })
      router.push(`/?loginEmail=${data.email}`)
    } catch (error) {
      const errorMessage = (error as any).message

      if (errorMessage === 'INVALID_TOKEN') {
        toast({
          title: 'Invalid password reset link.',
          variant: 'destructive',
        })

        router.push('/')

        return
      }

      toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    const { token } = router.query

    if (token) {
      const decoded = jwtDecode(token as string) as { email: string }

      if (decoded.email) {
        form.setValue('email', decoded.email)
      }
    }
  }, [router.query.token])

  return (
    <div className="w-full max-w-md m-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <span className="text-lg font-semibold leading-none tracking-tight">
              Password Reset
            </span>

            <span className="text-sm text-muted-foreground">
              Reset your password
            </span>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            )}{' '}
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default ResetPassword
