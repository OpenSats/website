import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { StrapiPerk } from '../server/types'
import { env } from '../env.mjs'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { toast } from './ui/use-toast'
import { useFundSlug } from '../utils/use-fund-slug'
import { trpc } from '../utils/trpc'
import Spinner from './Spinner'
import { ShoppingBagIcon } from 'lucide-react'

type Props = { perk: StrapiPerk; balance: number; close: () => void }

const schema = z.object({
  shippingAddressLine1: z.string(),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string(),
  shippingState: z.string(),
  shippingCountry: z.string(),
  shippingZip: z.string(),
  shippingPhone: z.string(),
})

type PerkPurchaseInputs = z.infer<typeof schema>

function PerkPurchaseFormModal({ perk, balance, close }: Props) {
  const fundSlug = useFundSlug()
  const purchasePerkMutation = trpc.perk.purchasePerk.useMutation()

  const hasEnoughBalance = balance - perk.price > 0

  const form = useForm<PerkPurchaseInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      shippingAddressLine1: '',
      shippingAddressLine2: '',
      shippingCity: '',
      shippingState: '',
      shippingCountry: '',
      shippingZip: '',
      shippingPhone: '',
    },
    shouldFocusError: false,
  })

  async function onSubmit(data: PerkPurchaseInputs) {
    if (!fundSlug) return

    try {
      await purchasePerkMutation.mutateAsync({ perkId: perk.documentId, fundSlug, ...data })

      toast({ title: 'Perk successfully purchased!' })

      close()
    } catch (error) {
      toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-row gap-8">
      <div className="flex w-96 h-96">
        <Image
          alt={perk.name}
          src={env.NEXT_PUBLIC_STRAPI_URL + perk.images[0]!.formats.large.url}
          width={600}
          height={600}
          style={{ objectFit: 'contain' }}
          className="cursor-pointer rounded-t-xl"
        />
      </div>

      <div className="flex flex-col space-y-8 grow">
        <div className="flex flex-col">
          <h1 className="font-semibold">{perk.name}</h1>
          <p className="text-muted-foreground">{perk.description}</p>
        </div>

        <div className="flex flex-col">
          <p className="text-lg text-green-500">{perk.price} points</p>
          {!hasEnoughBalance && (
            <p className="text-sm text-red-500">You don&apos;t have enough points.</p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="shippingAddressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping address line 1</FormLabel>
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
                  <FormLabel>Shipping address line 2</FormLabel>
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
                  <FormLabel>Shipping country</FormLabel>
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
                  <FormLabel>Shipping state</FormLabel>
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
                  <FormLabel>Shipping city</FormLabel>
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
                  <FormLabel>Shipping postal code</FormLabel>
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
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="button" size="lg" disabled={!hasEnoughBalance} className="w-full">
              {purchasePerkMutation.isPending ? <Spinner /> : <ShoppingBagIcon />}
              Purchase
            </Button>
          </form>
        </Form>

        <form></form>

        <span className="text-muted-foreground">You have {balance} points</span>
      </div>
    </div>
  )
}

export default PerkPurchaseFormModal
