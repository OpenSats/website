import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { BoxIcon, Check, ChevronsUpDown, ShoppingBagIcon, TruckIcon } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { StrapiPerkPopulated } from '../server/types'
import { env } from '../env.mjs'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { toast } from './ui/use-toast'
import { useFundSlug } from '../utils/use-fund-slug'
import { trpc } from '../utils/trpc'
import Spinner from './Spinner'
import { cn } from '../utils/cn'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel'
import CustomLink from './CustomLink'
import { Checkbox } from './ui/checkbox'

type Props = { perk: StrapiPerkPopulated; balance: number; close: () => void }

const pointFormat = Intl.NumberFormat('en', { notation: 'standard', compactDisplay: 'long' })

const schema = z
  .object({
    shippingAddressLine1: z.string().min(1),
    shippingAddressLine2: z.string(),
    shippingCity: z.string().min(1),
    shippingState: z.string(),
    shippingCountry: z.string().min(1),
    shippingZip: z.string().min(1),
    shippingPhone: z
      .string()
      .min(1)
      .regex(/^\+?\d{6,15}$/, 'Invalid phone number.'),
    shippingTaxNumber: z.string(),
    printfulSyncVariantId: z.string().optional(),
    _shippingStateOptionsLength: z.number(),
    _useAccountMailingAddress: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const cpfRegex =
      /([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})/

    if (data.shippingCountry === 'BR') {
      if (data.shippingTaxNumber.length < 1) {
        ctx.addIssue({
          path: ['shippingTaxNumber'],
          code: 'custom',
          message: 'CPF is required.',
        })
        return
      }

      if (!cpfRegex.test(data.shippingTaxNumber)) {
        ctx.addIssue({
          path: ['shippingTaxNumber'],
          code: 'custom',
          message: 'Invalid CPF.',
        })
        return
      }
    }
  })
  .superRefine((data, ctx) => {
    if (!data.shippingState && data._shippingStateOptionsLength) {
      ctx.addIssue({
        path: ['shippingState'],
        code: 'custom',
        message: 'State is required.',
      })
      return
    }
  })

type PerkPurchaseInputs = z.infer<typeof schema>

type CostEstimate = { product: number; shipping: number; tax: number; total: number }

function PerkPurchaseFormModal({ perk, balance, close }: Props) {
  const router = useRouter()
  const fundSlug = useFundSlug()
  const getCountriesQuery = trpc.perk.getCountries.useQuery()
  const getUserAttributesQuery = trpc.account.getUserAttributes.useQuery()
  const purchasePerkMutation = trpc.perk.purchasePerk.useMutation()
  const estimatePrintfulOrderCosts = trpc.perk.estimatePrintfulOrderCosts.useMutation()

  const getPrintfulProductVariantsQuery = trpc.perk.getPrintfulProductVariants.useQuery(
    { printfulProductId: perk.printfulProductId || '' },
    { enabled: !!perk.printfulProductId }
  )

  const form = useForm<PerkPurchaseInputs>({
    resolver: zodResolver(perk.needsShippingAddress ? schema : z.object({})),
    mode: 'all',
    defaultValues: {
      _shippingStateOptionsLength: 0,
      shippingAddressLine1: '',
      shippingAddressLine2: '',
      shippingCity: '',
      shippingState: '',
      shippingCountry: '',
      shippingZip: '',
      shippingPhone: '',
      shippingTaxNumber: '',
    },
    shouldFocusError: false,
  })

  const [countrySelectOpen, setCountrySelectOpen] = useState(false)
  const [stateSelectOpen, setStateSelectOpen] = useState(false)
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null)

  const hasEnoughBalance = balance - (costEstimate?.total || perk.price) > 0

  const shippingCountryOptions = (getCountriesQuery.data || []).map((country) => ({
    label: country.name,
    value: country.code,
  }))

  const shippingCountry = form.watch('shippingCountry')
  const shippingState = form.watch('shippingState')
  const printfulSyncVariantId = form.watch('printfulSyncVariantId')
  const useAccountMailingAddress = form.watch('_useAccountMailingAddress')

  const shippingStateOptions = useMemo(() => {
    const selectedCountry = (getCountriesQuery.data || []).find(
      (country) => country.code === shippingCountry
    )

    const stateOptions =
      selectedCountry?.states?.map((state) => ({
        label: state.name,
        value: state.code,
      })) || []

    return stateOptions
  }, [shippingCountry])

  useEffect(() => {
    form.setValue('shippingState', '')
    form.setValue('shippingTaxNumber', '')
  }, [shippingCountry])

  useEffect(() => {
    form.setValue('_shippingStateOptionsLength', shippingStateOptions.length)
  }, [shippingStateOptions])

  useEffect(() => {
    if (!getUserAttributesQuery.data) return

    if (useAccountMailingAddress) {
      form.setValue('shippingAddressLine1', getUserAttributesQuery.data.addressLine1)
      form.setValue('shippingAddressLine2', getUserAttributesQuery.data.addressLine2)
      form.setValue('shippingCountry', getUserAttributesQuery.data.addressCountry)
      form.setValue('shippingCity', getUserAttributesQuery.data.addressCity)
      form.setValue('shippingZip', getUserAttributesQuery.data.addressZip)
      setTimeout(() => form.setValue('shippingState', getUserAttributesQuery.data.addressState), 20)
    } else {
      form.setValue('shippingAddressLine1', '')
      form.setValue('shippingAddressLine2', '')
      form.setValue('shippingCountry', '')
      form.setValue('shippingState', '')
      form.setValue('shippingCity', '')
      form.setValue('shippingZip', '')
    }
  }, [useAccountMailingAddress])

  async function onSubmit(data: PerkPurchaseInputs) {
    if (!fundSlug) return

    // Get order estimate if needed
    if (perk.needsShippingAddress && !costEstimate && data.printfulSyncVariantId) {
      try {
        const _costEstimate = await estimatePrintfulOrderCosts.mutateAsync({
          ...data,

          printfulSyncVariantId: Number(data.printfulSyncVariantId),
        })

        setCostEstimate(_costEstimate)
      } catch {
        toast({
          title: 'Sorry, something went wrong.',
          variant: 'destructive',
        })
      }

      return
    }

    // Make purchase
    if (!perk.needsShippingAddress || !!costEstimate) {
      try {
        await purchasePerkMutation.mutateAsync({
          perkId: perk.documentId,
          fundSlug,
          perkPrintfulSyncVariantId: Number(data.printfulSyncVariantId) || undefined,
          ...data,
        })
        toast({ title: 'Perk successfully purchased!' })
        router.push(`/${fundSlug}/account/point-history`)
        close()
      } catch (error) {
        toast({
          title: 'Sorry, something went wrong.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="min-w-0 flex flex-col md:flex-row gap-8 items-start">
      <div className="p-10 hidden md:block">
        <Carousel className="w-80 h-80">
          <CarouselContent>
            {perk.images.map((image) => (
              <CarouselItem key={image.formats.medium.url}>
                <Image
                  alt={perk.name}
                  src={
                    process.env.NODE_ENV !== 'production'
                      ? env.NEXT_PUBLIC_STRAPI_URL + image.formats.medium.url
                      : image.formats.medium.url
                  }
                  width={600}
                  height={600}
                  style={{ objectFit: 'contain' }}
                  className="w-80 h-80"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full md:max-w-md flex flex-col space-y-8"
        >
          <div className="flex flex-col justify-start">
            <div className="mx-auto p-10 md:hidden justify-center items-center">
              <Carousel className="w-40 sm:w-56 h-40 sm:h-56">
                <CarouselContent>
                  {perk.images.map((image) => (
                    <CarouselItem key={image.formats.medium.url}>
                      <Image
                        alt={perk.name}
                        src={
                          process.env.NODE_ENV !== 'production'
                            ? env.NEXT_PUBLIC_STRAPI_URL + image.formats.medium.url
                            : image.formats.medium.url
                        }
                        width={200}
                        height={200}
                        style={{ objectFit: 'contain' }}
                        className="w-40 sm:w-56 h-40 sm:h-56"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="flex flex-col">
                <h1 className="font-semibold">{perk.name}</h1>
                {!costEstimate && <p className="text-muted-foreground">{perk.description}</p>}
                {!costEstimate && perk.productDetailsUrl && (
                  <CustomLink className="text-xs" href={perk.productDetailsUrl}>
                    View product details
                  </CustomLink>
                )}
                {!!costEstimate && printfulSyncVariantId && (
                  <p className="text-muted-foreground">
                    {
                      getPrintfulProductVariantsQuery.data?.find(
                        (variant) => variant.id === Number(printfulSyncVariantId)
                      )?.name
                    }
                  </p>
                )}
              </div>

              {!costEstimate && (
                <div className="flex flex-col">
                  <Label>Price</Label>

                  <p className="mt-1 text-lg text-green-500">
                    <strong className="font-semibold">{pointFormat.format(perk.price)}</strong>{' '}
                    points
                  </p>

                  <span
                    className={cn(
                      'text-xs',
                      hasEnoughBalance ? 'text-muted-foreground' : 'text-red-500'
                    )}
                  >
                    You have {pointFormat.format(balance)} points
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4 grow">
            {perk.needsShippingAddress && hasEnoughBalance && !costEstimate && (
              <>
                {perk.needsShippingAddress && !!getPrintfulProductVariantsQuery.data && (
                  <div className="flex flex-col">
                    <FormField
                      control={form.control}
                      name="printfulSyncVariantId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Options *</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select size and color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getPrintfulProductVariantsQuery.data.map((variant) => (
                                <SelectItem
                                  key={variant.id}
                                  value={variant.id.toString()}
                                >{`${variant.size} | ${variant.color}`}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {perk.needsShippingAddress && !getPrintfulProductVariantsQuery.data && <Spinner />}

                {getUserAttributesQuery.data?.addressLine1 && (
                  <FormField
                    control={form.control}
                    name="_useAccountMailingAddress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 flex flex-col items-start leading-none">
                          <FormLabel>Use saved mailing address</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="shippingAddressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address line 1 *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={useAccountMailingAddress} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingAddressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address line 2</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={useAccountMailingAddress} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingCountry"
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
                                disabled={useAccountMailingAddress}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      (getCountriesQuery.data || []).find(
                                        (country) => country.code === shippingCountry
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
                                {shippingCountryOptions.map((country) => (
                                  <CommandItem
                                    value={country.label}
                                    key={country.value}
                                    onSelect={() => (
                                      form.setValue('shippingCountry', country.value, {
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

                {!!shippingStateOptions.length && (
                  <FormField
                    control={form.control}
                    name="shippingState"
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
                                <Select disabled={useAccountMailingAddress}>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        shippingStateOptions.find(
                                          (state) => state.value === shippingState
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
                                  {shippingStateOptions.map((state) => (
                                    <CommandItem
                                      value={state.label}
                                      key={state.value}
                                      onSelect={() => (
                                        form.setValue('shippingState', state.value, {
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
                  name="shippingCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={useAccountMailingAddress} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingZip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={useAccountMailingAddress} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {shippingCountry === 'BR' && (
                  <FormField
                    control={form.control}
                    name="shippingTaxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax number (CPF) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <span className="text-xs text-muted-foreground">
                  Price subject to change depending on your region.
                </span>

                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    !(
                      form.formState.isValid &&
                      hasEnoughBalance &&
                      !estimatePrintfulOrderCosts.isPending
                    )
                  }
                  className="w-full"
                >
                  {estimatePrintfulOrderCosts.isPending ? <Spinner /> : <TruckIcon />}
                  Calculate shipping costs
                </Button>
              </>
            )}

            {!!costEstimate && (
              <div className="flex flex-col mb-auto">
                <Table className="w-fit">
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Item</TableCell>
                      <TableCell>{pointFormat.format(costEstimate.product)} points</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Shipping</TableCell>
                      <TableCell>{pointFormat.format(costEstimate.shipping)} points</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tax</TableCell>
                      <TableCell>{pointFormat.format(costEstimate.tax)} points</TableCell>
                    </TableRow>
                    <TableRow className="text-lg">
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-green-500">
                        <strong className="font-semibold">
                          {pointFormat.format(costEstimate.total)}
                        </strong>{' '}
                        points
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <span
                  className={cn(
                    'text-xs',
                    hasEnoughBalance ? 'text-muted-foreground' : 'text-red-500'
                  )}
                >
                  You have {pointFormat.format(balance)} points
                </span>
              </div>
            )}

            {((perk.needsShippingAddress && !!costEstimate) || !perk.needsShippingAddress) && (
              <Button
                type="submit"
                size="lg"
                disabled={
                  !(form.formState.isValid && hasEnoughBalance && !purchasePerkMutation.isPending)
                }
                className="w-full max-w-96 mx-auto md:mx-0"
              >
                {purchasePerkMutation.isPending ? <Spinner /> : <ShoppingBagIcon />}
                Purchase
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PerkPurchaseFormModal
