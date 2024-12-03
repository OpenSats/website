import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { trpc } from '../utils/trpc'
import Spinner from './Spinner'

const schema = z.object({
  email: z.string().email(),
})

type PasswordResetFormInputs = z.infer<typeof schema>

type Props = { close: () => void }

function PasswordResetFormModal({ close }: Props) {
  const { toast } = useToast()

  const form = useForm<PasswordResetFormInputs>({ resolver: zodResolver(schema) })

  const requestPasswordResetMutation = trpc.auth.requestPasswordReset.useMutation()

  async function onSubmit(data: PasswordResetFormInputs) {
    try {
      await requestPasswordResetMutation.mutateAsync(data)

      toast({ title: 'A password reset link has been sent to your email.' })
      close()
      form.reset({ email: '' })
    } catch (error) {
      toast({ title: 'Sorry, something went wrong.', variant: 'destructive' })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>Recover your account.</DialogDescription>
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

          <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Spinner />} Reset Password
          </Button>
        </form>
      </Form>
    </>
  )
}

export default PasswordResetFormModal
