import Image from 'next/image'
import { BoxIcon, ShoppingBagIcon, TruckIcon } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { StrapiPerkPopulated } from '../server/types'
import { env } from '../env.mjs'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { toast } from './ui/use-toast'
import { useFundSlug } from '../utils/use-fund-slug'
import { trpc } from '../utils/trpc'
import Spinner from './Spinner'
import { cn } from '../utils/cn'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useState } from 'react'

type Props = { perk: StrapiPerkPopulated; balance: number; close: () => void }

const pointFormat = Intl.NumberFormat('en', { notation: 'standard', compactDisplay: 'long' })

const schema = z.object({
  shippingAddressLine1: z.string().min(1),
  shippingAddressLine2: z.string(),
  shippingCity: z.string().min(1),
  shippingState: z.string().min(1),
  shippingCountry: z.string().min(1),
  shippingZip: z.string().min(1),
  shippingPhone: z.string().min(1),
  shippingTaxNumber: z.string(),
  printfulSyncVariantId: z.string().optional(),
})

type PerkPurchaseInputs = z.infer<typeof schema>

type CostEstimate = { shipping: number; tax: number; total: number }

function PerkPurchaseFormModal({ perk, balance, close }: Props) {
  const router = useRouter()
  const fundSlug = useFundSlug()
  const purchasePerkMutation = trpc.perk.purchasePerk.useMutation()
  const estimatePrintfulOrderCosts = trpc.perk.estimatePrintfulOrderCosts.useMutation()

  const getPrintfulProductVariantsQuery = trpc.perk.getPrintfulProductVariants.useQuery(
    { printfulProductId: perk.printfulProductId || '' },
    { enabled: !!perk.printfulProductId }
  )

  const hasEnoughBalance = balance - perk.price > 0

  const form = useForm<PerkPurchaseInputs>({
    resolver: zodResolver(perk.needsShippingAddress ? schema : z.object({})),
    defaultValues: {
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

  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null)

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
    <div className="flex flex-row gap-8">
      <div className="flex w-96 h-96">
        <Image
          alt={perk.name}
          src={env.NEXT_PUBLIC_STRAPI_URL + perk.images[0]!.formats.medium.url}
          width={600}
          height={600}
          style={{ objectFit: 'contain' }}
          className="cursor-pointer rounded-t-xl"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-8 grow">
          <div className="flex flex-col">
            <h1 className="font-semibold">{perk.name}</h1>
            <p className="text-muted-foreground">{perk.description}</p>
          </div>

          <div className="flex flex-col">
            <Label>Price</Label>

            <p className="mt-1 text-lg text-green-500">
              <strong className="font-semibold">{pointFormat.format(perk.price)}</strong> points
            </p>

            <span
              className={cn('text-xs', hasEnoughBalance ? 'text-muted-foreground' : 'text-red-500')}
            >
              You have {pointFormat.format(balance)} points
            </span>
          </div>

          <div className="flex flex-col space-y-4">
            {perk.needsShippingAddress && hasEnoughBalance && !costEstimate && (
              <>
                {!!getPrintfulProductVariantsQuery.data && (
                  <div className="flex flex-col">
                    <FormField
                      control={form.control}
                      name="printfulSyncVariantId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Options</FormLabel>
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

                <FormField
                  control={form.control}
                  name="shippingAddressLine1"
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
                  name="shippingAddressLine2"
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
                  name="shippingCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingCity"
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
                  name="shippingZip"
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
              <div className="flex flex-col">
                <Label>Costs</Label>

                <p className="mt-1">Shipping: {pointFormat.format(costEstimate.shipping)} points</p>
                <p className="mt-1">Tax: {pointFormat.format(costEstimate.tax)} points</p>
                <p className="mt-1">Total: {pointFormat.format(costEstimate.total)} points</p>
              </div>
            )}

            {!!costEstimate && (
              <Button
                type="submit"
                size="lg"
                disabled={
                  !(form.formState.isValid && hasEnoughBalance && !purchasePerkMutation.isPending)
                }
                className="w-full"
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
