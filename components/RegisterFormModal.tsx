import { useEffect, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Select, SelectTrigger, SelectValue } from './ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { cn } from '../utils/cn'
import { Checkbox } from './ui/checkbox'
import { env } from '../env.mjs'
import { useRouter } from 'next/router'

const schema = z
  .object({
    turnstileToken: z.string().min(1),
    firstName: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-záéíóúÁÉÍÓÚñÑçÇ]+$/, 'Use alphabetic characters only.'),
    lastName: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-záéíóúÁÉÍÓÚñÑçÇ]+$/, 'Use alphabetic characters only.'),
    company: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    _addMailingAddress: z.boolean(),
    address: z
      .object({
        addressLine1: z.string(),
        addressLine2: z.string(),
        city: z.string(),
        state: z.string(),
        country: z.string(),
        zip: z.string(),
        _addressStateOptionsLength: z.number(),
      })
      .superRefine((data, ctx) => {
        if (!data.state && data._addressStateOptionsLength) {
          ctx.addIssue({
            path: ['shippingState'],
            code: 'custom',
            message: 'State is required.',
          })
        }
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data._addMailingAddress) {
      if (!data.address.addressLine1) {
        ctx.addIssue({
          path: ['shipping.addressLine1'],
          code: 'custom',
          message: 'Address line 1 is required.',
        })
      }

      if (!data.address.country) {
        ctx.addIssue({
          path: ['shipping.country'],
          code: 'custom',
          message: 'Country is required.',
        })
      }

      if (!data.address.city) {
        ctx.addIssue({
          path: ['shipping.city'],
          code: 'custom',
          message: 'City is required.',
        })
      }

      if (!data.address.zip) {
        ctx.addIssue({
          path: ['shipping.zip'],
          code: 'custom',
          message: 'Postal code is required.',
        })
      }
    }
  })

type RegisterFormInputs = z.infer<typeof schema>

type Props = { close: () => void; openLoginModal: () => void }

function RegisterFormModal({ close, openLoginModal }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const fundSlug = useFundSlug()
  const turnstileRef = useRef<TurnstileInstance | null>()
  const getCountriesQuery = trpc.perk.getCountries.useQuery()
  const registerMutation = trpc.auth.register.useMutation()

  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      password: '',
      confirmPassword: '',
      _addMailingAddress: false,
      address: {
        _addressStateOptionsLength: 0,
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: '',
        state: '',
        zip: '',
      },
    },
  })

  const addressCountryOptions = (getCountriesQuery.data || []).map((country) => ({
    label: country.name,
    value: country.code,
  }))

  const addressCountry = form.watch('address.country')
  const addressState = form.watch('address.state')
  const addMailingAddress = form.watch('_addMailingAddress')

  const addressStateOptions = useMemo(() => {
    const selectedCountry = (getCountriesQuery.data || []).find(
      (country) => country.code === addressCountry
    )

    const stateOptions =
      selectedCountry?.states?.map((state) => ({
        label: state.name,
        value: state.code,
      })) || []

    return stateOptions
  }, [addressCountry])

  useEffect(() => {
    if (!fundSlug) return
    if (router.query.registerEmail) {
      if (router.query.registerEmail !== '1') {
        form.setValue('email', router.query.registerEmail as string)
        setTimeout(() => form.setFocus('password'), 100)
      }
      router.replace(`/${fundSlug}`)
    }
  }, [router.query.registerEmail])

  useEffect(() => {
    form.setValue('address.state', '')
  }, [addressCountry])

  useEffect(() => {
    form.setValue('address._addressStateOptionsLength', addressStateOptions.length)
  }, [addressStateOptions])

  useEffect(() => {
    form.setValue('address._addressStateOptionsLength', 0)
    form.setValue('address.addressLine1', '')
    form.setValue('address.addressLine2', '')
    form.setValue('address.city', '')
    form.setValue('address.country', '')
    form.setValue('address.state', '')
    form.setValue('address.zip', '')
  }, [addMailingAddress])

  const [countrySelectOpen, setCountrySelectOpen] = useState(false)
  const [stateSelectOpen, setStateSelectOpen] = useState(false)

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

    turnstileRef.current?.reset()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Register</DialogTitle>
        <DialogDescription>Start supporting projects today!</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          <div className="w-full space-y-4 sm:space-x-2 sm:space-y-0 flex flex-col sm:flex-row">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>First name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Last name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Email *</FormLabel>
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
                <FormLabel>Password *</FormLabel>
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
                <FormLabel>Confirm password *</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="_addMailingAddress"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 flex flex-col items-start leading-none">
                  <FormLabel>Add mailing address</FormLabel>
                  <FormDescription>
                    You can also manage your mailing address in the account settings.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {addMailingAddress && (
            <>
              <FormField
                control={form.control}
                name="address.addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 1 *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 2</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country *</FormLabel>
                    <Popover
                      modal
                      open={countrySelectOpen}
                      onOpenChange={(open) => setCountrySelectOpen(open)}
                    >
                      <PopoverTrigger>
                        <div>
                          <FormControl>
                            <Select
                              open={countrySelectOpen}
                              onValueChange={() => setCountrySelectOpen(false)}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    (getCountriesQuery.data || []).find(
                                      (country) => country.code === addressCountry
                                    )?.name || ''
                                  }
                                />
                              </SelectTrigger>
                            </Select>
                          </FormControl>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {addressCountryOptions.map((country) => (
                                <CommandItem
                                  value={country.label}
                                  key={country.value}
                                  onSelect={() => (
                                    form.setValue('address.country', country.value, {
                                      shouldValidate: true,
                                    }),
                                    setCountrySelectOpen(false)
                                  )}
                                >
                                  {country.label}
                                  <Check
                                    className={cn(
                                      'ml-auto',
                                      country.value === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!!addressStateOptions.length && (
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>State *</FormLabel>
                      <Popover
                        modal
                        open={stateSelectOpen}
                        onOpenChange={(open) => setStateSelectOpen(open)}
                      >
                        <PopoverTrigger>
                          <div>
                            <FormControl>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      addressStateOptions.find(
                                        (state) => state.value === addressState
                                      )?.label
                                    }
                                  />
                                </SelectTrigger>
                              </Select>
                            </FormControl>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search state..." />
                            <CommandList>
                              <CommandEmpty>No state found.</CommandEmpty>
                              <CommandGroup>
                                {addressStateOptions.map((state) => (
                                  <CommandItem
                                    value={state.label}
                                    key={state.value}
                                    onSelect={() => (
                                      form.setValue('address.state', state.value, {
                                        shouldValidate: true,
                                      }),
                                      setStateSelectOpen(false)
                                    )}
                                  >
                                    {state.label}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        state.value === field.value ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Turnstile
            ref={turnstileRef}
            siteKey={env.NEXT_PUBLIC_TURNSTILE_SITEKEY}
            onError={() => form.setValue('turnstileToken', '', { shouldValidate: true })}
            onExpire={() => form.setValue('turnstileToken', '', { shouldValidate: true })}
            onSuccess={(token) => form.setValue('turnstileToken', token, { shouldValidate: true })}
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
