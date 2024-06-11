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

type Props = { close: () => void }

function LoginFormModal({ close }: Props) {
  const { toast } = useToast()
  const form = useForm<LoginFormInputs>({ resolver: zodResolver(schema) })

  async function onSubmit(data: LoginFormInputs) {
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    })

    if (result?.error === 'INVALID_CREDENTIALS') {
      return form.setError(
        'password',
        { message: 'Invalid email or password.' },
        { shouldFocus: true }
      )
    }

    toast({
      title: 'Successfully logged in!',
    })

    close()
  }

  return (
    <DialogContent>
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

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            )}{' '}
            Login
          </Button>
        </form>
      </Form>
    </DialogContent>
  )
}

export default LoginFormModal
