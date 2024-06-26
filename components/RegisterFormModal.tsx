import { zodResolver } from '@hookform/resolvers/zod'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { trpc } from '../utils/trpc'

const schema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

type RegisterFormInputs = z.infer<typeof schema>

type Props = { close: () => void }

function RegisterFormModal({ close }: Props) {
  const { toast } = useToast()
  const form = useForm<RegisterFormInputs>({ resolver: zodResolver(schema) })
  const registerMutation = trpc.auth.register.useMutation()

  async function onSubmit(data: RegisterFormInputs) {
    try {
      await registerMutation.mutateAsync(data)

      toast({
        title: 'Please check your email to verify your account.',
      })

      close()
    } catch (error) {
      const errorMessage = (error as any).message

      if (errorMessage === 'EMAIL_TAKEN') {
        return form.setError(
          'email',
          { message: 'Email is already taken.' },
          { shouldFocus: true }
        )
      }

      toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Register</DialogTitle>
        <DialogDescription>
          Start supporting Monero projects today!
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            Register
          </Button>
        </form>
      </Form>
    </>
  )
}

export default RegisterFormModal
