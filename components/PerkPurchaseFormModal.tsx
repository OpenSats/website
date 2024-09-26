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
import { cn } from '../utils/cn'
import { Label } from './ui/label'
import { useRouter } from 'next/router'

type Props = { perk: StrapiPerk; balance: number; close: () => void }

const pointFormat = Intl.NumberFormat('en', { notation: 'standard', compactDisplay: 'long' })

const schema = z.object({
  shippingAddressLine1: z.string().min(1),
  shippingAddressLine2: z.string(),
  shippingCity: z.string().min(1),
  shippingState: z.string().min(1),
  shippingCountry: z.string().min(1),
  shippingZip: z.string().min(1),
  shippingPhone: z.string().min(1),
})

type PerkPurchaseInputs = z.infer<typeof schema>

function PerkPurchaseFormModal({ perk, balance, close }: Props) {
  const router = useRouter()
  const fundSlug = useFundSlug()
  const purchasePerkMutation = trpc.perk.purchasePerk.useMutation()

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
    },
    shouldFocusError: false,
  })

  async function onSubmit(data: PerkPurchaseInputs) {
    if (!fundSlug) return

    try {
      await purchasePerkMutation.mutateAsync({ perkId: perk.documentId, fundSlug, ...data })
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
            {perk.needsShippingAddress && hasEnoughBalance && (
              <>
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
              </>
            )}

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
          </form>
        </Form>
      </div>
    </div>
  )
}

export default PerkPurchaseFormModal
