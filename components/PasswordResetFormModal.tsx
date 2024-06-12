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
import { trpc } from '../utils/trpc'

const schema = z.object({
  email: z.string().email(),
})

type PasswordResetFormInputs = z.infer<typeof schema>

type Props = { close: () => void }

function PasswordResetFormModal({ close }: Props) {
  const { toast } = useToast()

  const form = useForm<PasswordResetFormInputs>({
    resolver: zodResolver(schema),
  })

  const requestPasswordResetMutation =
    trpc.auth.requestPasswordReset.useMutation()

  async function onSubmit(data: PasswordResetFormInputs) {
    await requestPasswordResetMutation.mutateAsync(data)

    toast({
      title: 'A password reset link has been sent to your email.',
    })

    close()
    form.reset({ email: '' })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>Recover your account.</DialogDescription>
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

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            )}{' '}
            Reset Password
          </Button>
        </form>
      </Form>
    </DialogContent>
  )
}

export default PasswordResetFormModal
