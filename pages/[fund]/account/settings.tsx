import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
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
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { Select, SelectTrigger, SelectValue } from '../../../components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/ui/command'
import { cn } from '../../../utils/cn'

const changeProfileFormSchema = z.object({ company: z.string() })

const changeEmailFormSchema = z.object({ newEmail: z.string().email() })

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

const changeMailingAddressFormSchema = z
  .object({
    addressLine1: z.string().min(1),
    addressLine2: z.string(),
    city: z.string().min(1),
    state: z.string(),
    country: z.string().min(1),
    zip: z.string().min(1),
    _addressStateOptionsLength: z.number(),
  })
  .superRefine((data, ctx) => {
    if (!data.state && data._addressStateOptionsLength) {
      ctx.addIssue({
        path: ['state'],
        code: 'custom',
        message: 'State is required.',
      })
      return
    }
  })

type ChangeProfileFormInputs = z.infer<typeof changeProfileFormSchema>
type ChangeEmailFormInputs = z.infer<typeof changeEmailFormSchema>
type ChangePasswordFormInputs = z.infer<typeof changePasswordFormSchema>
type ChangeMailingAddressFormInputs = z.infer<typeof changeMailingAddressFormSchema>

function Settings() {
  const router = useRouter()
  const fundSlug = useFundSlug()
  const session = useSession()
  const getUserAttributesQuery = trpc.account.getUserAttributes.useQuery()
  const getCountriesQuery = trpc.perk.getCountries.useQuery()
  const changeProfileMutation = trpc.account.changeProfile.useMutation()
  const requestEmailChangeMutation = trpc.account.requestEmailChange.useMutation()
  const changePasswordMutation = trpc.account.changePassword.useMutation()
  const changeMailingAddressMutation = trpc.account.changeMailingAddress.useMutation()

  const changeProfileForm = useForm<ChangeProfileFormInputs>({
    resolver: zodResolver(changeProfileFormSchema),
    defaultValues: { company: '' },
    mode: 'all',
  })

  const changeEmailForm = useForm<ChangeEmailFormInputs>({
    resolver: zodResolver(changeEmailFormSchema),
    defaultValues: { newEmail: '' },
    mode: 'all',
  })

  const changePasswordForm = useForm<ChangePasswordFormInputs>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'all',
  })

  const changeMailingAddressForm = useForm<ChangeMailingAddressFormInputs>({
    resolver: zodResolver(changeMailingAddressFormSchema),
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      zip: '',
      city: '',
      state: '',
      country: '',
    },
    mode: 'all',
  })

  const addressCountryOptions = (getCountriesQuery.data || []).map((country) => ({
    label: country.name,
    value: country.code,
  }))

  const addressCountry = changeMailingAddressForm.watch('country')
  const addressState = changeMailingAddressForm.watch('state')

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
    changeMailingAddressForm.setValue('state', '')
  }, [addressCountry])

  useEffect(() => {
    changeMailingAddressForm.setValue('_addressStateOptionsLength', addressStateOptions.length)
  }, [addressStateOptions])

  useEffect(() => {
    if (!getUserAttributesQuery.data) return

    changeProfileForm.setValue('company', getUserAttributesQuery.data.company)
    changeMailingAddressForm.setValue('addressLine1', getUserAttributesQuery.data.addressLine1)
    changeMailingAddressForm.setValue('addressLine2', getUserAttributesQuery.data.addressLine2)
    changeMailingAddressForm.setValue('country', getUserAttributesQuery.data.addressCountry)
    changeMailingAddressForm.setValue('city', getUserAttributesQuery.data.addressCity)
    changeMailingAddressForm.setValue('zip', getUserAttributesQuery.data.addressZip)
    setTimeout(
      () => changeMailingAddressForm.setValue('state', getUserAttributesQuery.data.addressState),
      20
    )
  }, [getUserAttributesQuery.data])

  const [countrySelectOpen, setCountrySelectOpen] = useState(false)
  const [stateSelectOpen, setStateSelectOpen] = useState(false)

  async function onChangeProfileSubmit(data: ChangeProfileFormInputs) {
    try {
      await changeProfileMutation.mutateAsync(data)
      toast({ title: 'Your profile has successfully been changed!' })
    } catch (error) {
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

  async function onChangePasswordSubmit(data: ChangePasswordFormInputs) {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      changePasswordForm.reset()

      toast({ title: 'Your password has successfully been changed! Please log in again.' })
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

  async function onChangeMailingAddressSubmit(data: ChangeMailingAddressFormInputs) {
    try {
      await changeMailingAddressMutation.mutateAsync(data)
      toast({ title: 'Your mailing address has successfully been changed!' })
    } catch (error) {
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
          <h1 className="font-bold">Change Profile</h1>

          <Form {...changeEmailForm}>
            <form
              onSubmit={changeProfileForm.handleSubmit(onChangeProfileSubmit)}
              className="flex flex-col space-y-4"
            >
              <FormField
                control={changeProfileForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={
                  changeProfileForm.formState.isSubmitting || !changeProfileForm.formState.isValid
                }
              >
                {changeProfileForm.formState.isSubmitting && <Spinner />} Change Profile
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
                    <FormLabel>Email *</FormLabel>
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
                    <FormLabel>Current password *</FormLabel>
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
                    <FormLabel>New password *</FormLabel>
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
                    <FormLabel>Confirm new password *</FormLabel>
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
          <h1 className="font-bold">Change Mailing Address</h1>

          <Form {...changeEmailForm}>
            <form
              onSubmit={changeMailingAddressForm.handleSubmit(onChangeMailingAddressSubmit)}
              className="flex flex-col space-y-4"
            >
              <FormField
                control={changeMailingAddressForm.control}
                name="addressLine1"
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
                control={changeMailingAddressForm.control}
                name="addressLine2"
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
                control={changeMailingAddressForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country *</FormLabel>
                    <Popover
                      modal
                      open={countrySelectOpen}
                      onOpenChange={(open) => setCountrySelectOpen(open)}
                    >
                      <PopoverTrigger asChild>
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
                                    changeMailingAddressForm.setValue('country', country.value, {
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
                  control={changeMailingAddressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>State *</FormLabel>
                      <Popover
                        modal
                        open={stateSelectOpen}
                        onOpenChange={(open) => setStateSelectOpen(open)}
                      >
                        <PopoverTrigger asChild>
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
                                    onSelect={() => {
                                      console.log('asdasd')
                                      changeMailingAddressForm.setValue('state', state.value, {
                                        shouldValidate: true,
                                      })
                                      setStateSelectOpen(false)
                                    }}
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
                control={changeMailingAddressForm.control}
                name="city"
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
                control={changeMailingAddressForm.control}
                name="zip"
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

              <Button
                disabled={
                  changeMailingAddressForm.formState.isSubmitting ||
                  !changeMailingAddressForm.formState.isValid
                }
              >
                {changeMailingAddressForm.formState.isSubmitting && <Spinner />} Change Mailing
                Address
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}

export default Settings
