import { zodResolver } from '@hookform/resolvers/zod'
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
import { useFundSlug } from '../utils/use-fund-slug'
import Spinner from './Spinner'

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

type Props = { close: () => void; openLoginModal: () => void }

function RegisterFormModal({ close, openLoginModal }: Props) {
  const { toast } = useToast()
  const form = useForm<RegisterFormInputs>({ resolver: zodResolver(schema) })
  const fundSlug = useFundSlug()
  const registerMutation = trpc.auth.register.useMutation()

  async function onSubmit(data: RegisterFormInputs) {
    if (!fundSlug) return

    try {
      await registerMutation.mutateAsync({ ...data, fundSlug })

      toast({
        title: 'Please check your email to verify your account.',
      })

      close()
    } catch (error) {
      const errorMessage = (error as any).message

      if (errorMessage === 'EMAIL_TAKEN') {
        return form.setError('email', { message: 'Email is already taken.' }, { shouldFocus: true })
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
        <DialogDescription>Start supporting projects today!</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
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

          <div className="flex flex-row space-x-2">
            <Button
              type="button"
              variant="link"
              className="grow basis-0"
              onClick={() => (openLoginModal(), close())}
            >
              I already have an account
            </Button>

            <Button
              type="submit"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className="grow basis-0"
            >
              {form.formState.isSubmitting && <Spinner />} Register
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
1

export default RegisterFormModal
