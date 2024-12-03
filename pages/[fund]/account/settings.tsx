import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Head from 'next/head'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/button'
import Spinner from '../../../components/Spinner'
import { toast } from '../../../components/ui/use-toast'
import { trpc } from '../../../utils/trpc'
import { useFundSlug } from '../../../utils/use-fund-slug'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword'],
  })

const changeEmailFormSchema = z.object({ newEmail: z.string().email() })

type ChangePasswordFormInputs = z.infer<typeof changePasswordFormSchema>
type ChangeEmailFormInputs = z.infer<typeof changeEmailFormSchema>

function Settings() {
  const router = useRouter()
  const fundSlug = useFundSlug()
  const session = useSession()
  const changePasswordMutation = trpc.account.changePassword.useMutation()
  const requestEmailChangeMutation = trpc.account.requestEmailChange.useMutation()

  const changePasswordForm = useForm<ChangePasswordFormInputs>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'all',
  })

  const changeEmailForm = useForm<ChangeEmailFormInputs>({
    resolver: zodResolver(changeEmailFormSchema),
    defaultValues: { newEmail: '' },
    mode: 'all',
  })

  async function onChangePasswordSubmit(data: ChangePasswordFormInputs) {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      changePasswordForm.reset()

      toast({ title: 'Password successfully changed! Please log in again.' })
      await signOut({ redirect: false })
      router.push(`/${fundSlug}/?loginEmail=${session.data?.user.email}`)
    } catch (error) {
      const errorMessage = (error as any).message

      if (errorMessage === 'INVALID_PASSWORD') {
        return changePasswordForm.setError(
          'currentPassword',
          { message: 'Invalid password.' },
          { shouldFocus: true }
        )
      }

      return toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }
  }

  async function onChangeEmailSubmit(data: ChangeEmailFormInputs) {
    if (!fundSlug) return

    try {
      await requestEmailChangeMutation.mutateAsync({ fundSlug, newEmail: data.newEmail })
      changeEmailForm.reset()
      toast({ title: 'A verification link has been sent to your email.' })
    } catch (error) {
      const errorMessage = (error as any).message

      if (errorMessage === 'EMAIL_TAKEN') {
        return changeEmailForm.setError(
          'newEmail',
          { message: 'Email is already taken.' },
          { shouldFocus: true }
        )
      }

      return toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Head>
        <title>MAGIC Grants - Settings</title>
      </Head>

      <div className="w-full max-w-lg mx-auto flex flex-col space-y-12">
        <div className="w-full flex flex-col space-y-6">
          <h1 className="font-bold">Change Password</h1>

          <Form {...changePasswordForm}>
            <form
              onSubmit={changePasswordForm.handleSubmit(onChangePasswordSubmit)}
              className="flex flex-col space-y-4"
            >
              <FormField
                control={changePasswordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={changePasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={changePasswordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={
                  changePasswordForm.formState.isSubmitting || !changePasswordForm.formState.isValid
                }
              >
                {changePasswordForm.formState.isSubmitting && <Spinner />} Change Password
              </Button>
            </form>
          </Form>
        </div>

        <div className="w-full flex flex-col space-y-6">
          <h1 className="font-bold">Change Email</h1>

          <Form {...changeEmailForm}>
            <form
              onSubmit={changeEmailForm.handleSubmit(onChangeEmailSubmit)}
              className="flex flex-col space-y-4"
            >
              <FormField
                control={changeEmailForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder={session.data?.user.email} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={
                  changeEmailForm.formState.isSubmitting || !changeEmailForm.formState.isValid
                }
              >
                {changeEmailForm.formState.isSubmitting && <Spinner />} Change Email
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}

export default Settings
