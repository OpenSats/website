import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { faMonero } from '@fortawesome/free-brands-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DollarSign, Info } from 'lucide-react'
import { z } from 'zod'
import Image from 'next/image'

import { MAX_AMOUNT } from '../config'
import Spinner from './Spinner'
import { trpc } from '../utils/trpc'
import { useToast } from './ui/use-toast'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { ProjectItem } from '../utils/types'
import { useFundSlug } from '../utils/use-fund-slug'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import CustomLink from './CustomLink'

type Props = {
  project: ProjectItem | undefined
}

const DonationFormModal: React.FC<Props> = ({ project }) => {
  const fundSlug = useFundSlug()
  const session = useSession()
  const isAuthed = session.status === 'authenticated'

  const schema = z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      amount: z.coerce.number().min(1).max(MAX_AMOUNT),
      taxDeductible: z.enum(['yes', 'no']),
    })
    .refine((data) => (!isAuthed && data.taxDeductible === 'yes' ? !!data.name : true), {
      message: 'Name is required when the donation is tax deductible.',
      path: ['name'],
    })
    .refine((data) => (!isAuthed && data.taxDeductible === 'yes' ? !!data.email : true), {
      message: 'Email is required when the donation is tax deductible.',
      path: ['email'],
    })

  type FormInputs = z.infer<typeof schema>

  const { toast } = useToast()

  const form = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      amount: '' as unknown as number, // a trick to get trigger to work when amount is empty
      taxDeductible: 'no',
    },
    mode: 'all',
  })

  const amount = form.watch('amount')
  const taxDeductible = form.watch('taxDeductible')

  const donateWithFiatMutation = trpc.donation.donateWithFiat.useMutation()
  const donateWithCryptoMutation = trpc.donation.donateWithCrypto.useMutation()

  async function handleBtcPay(data: FormInputs) {
    if (!project) return
    if (!fundSlug) return

    try {
      const result = await donateWithCryptoMutation.mutateAsync({
        email: data.email || null,
        name: data.name || null,
        amount: data.amount,
        projectSlug: project.slug,
        projectName: project.title,
        fundSlug,
        taxDeductible: data.taxDeductible === 'yes',
      })

      window.location.assign(result.url)
    } catch (e) {
      toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }
  }

  async function handleFiat(data: FormInputs) {
    if (!project) return
    if (!fundSlug) return

    try {
      const result = await donateWithFiatMutation.mutateAsync({
        email: data.email || null,
        name: data.name || null,
        amount: data.amount,
        projectSlug: project.slug,
        projectName: project.title,
        fundSlug,
        taxDeductible: data.taxDeductible === 'yes',
      })

      if (!result.url) throw Error()

      window.location.assign(result.url)
    } catch (e) {
      toast({
        title: 'Sorry, something went wrong.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    form.trigger('email', { shouldFocus: true })
    form.trigger('name', { shouldFocus: true })
  }, [taxDeductible])

  if (!project) return <></>

  return (
    <div className="space-y-4">
      <div className="py-4 flex flex-col space-y-8">
        <div className="flex flex-col items-center sm:space-x-4 sm:flex-row">
          <Image
            alt={project.title}
            src={project.coverImage}
            width={200}
            height={96}
            objectFit="cover"
            className="w-36 rounded-xl"
          />
          <div className="flex flex-col justify-center">
            <h2 className="text-center sm:text-left font-semibold">{project.title}</h2>
            <h3 className="text-gray-500">Pledge your support</h3>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="flex flex-col gap-4">
          {!isAuthed && (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name {taxDeductible === 'no' && '(optional)'}</FormLabel>
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
                    <FormLabel>Email {taxDeductible === 'no' && '(optional)'}</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="flex flex-row gap-2 items-center flex-wrap ">
                    <Input
                      className="w-40 mr-auto"
                      type="number"
                      inputMode="numeric"
                      leftIcon={DollarSign}
                      {...field}
                    />

                    {[50, 100, 250, 500].map((value, index) => (
                      <Button
                        key={`amount-button-${index}`}
                        variant="light"
                        size="sm"
                        type="button"
                        onClick={() =>
                          form.setValue('amount', value, {
                            shouldValidate: true,
                          })
                        }
                      >
                        ${value}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxDeductible"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Do you want this donation to be tax deductible? (US only)</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {amount > 500 && taxDeductible === 'yes' && (
            <Alert>
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                When donating over $500 with crypto, you MUST complete{' '}
                <CustomLink target="_blank" href="https://www.irs.gov/pub/irs-pdf/f8283.pdf">
                  Form 8283
                </CustomLink>{' '}
                and send the completed form to{' '}
                <CustomLink href={`mailto:info@magicgrants.org`}>info@magicgrants.org</CustomLink>{' '}
                to deduct your donation.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0">
            <Button
              type="button"
              onClick={form.handleSubmit(handleBtcPay)}
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className="grow basis-0"
            >
              {donateWithCryptoMutation.isPending ? (
                <Spinner />
              ) : (
                <FontAwesomeIcon icon={faMonero} className="h-5 w-5" />
              )}
              Donate with Crypto
            </Button>

            <Button
              type="button"
              onClick={form.handleSubmit(handleFiat)}
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className="grow basis-0 bg-indigo-500 hover:bg-indigo-700"
            >
              {donateWithFiatMutation.isPending ? (
                <Spinner />
              ) : (
                <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5" />
              )}
              Donate with Fiat
            </Button>
          </div>
        </form>
      </Form>

      {!isAuthed && <div className="w-full h-px bg-border" />}

      {!isAuthed && (
        <div className="flex flex-col items-center">
          <p>Want to support more projects from now on?</p>

          <Button type="button" size="lg" variant="link">
            Create an account
          </Button>
        </div>
      )}
    </div>
  )
}

export default DonationFormModal
