import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { faMonero } from '@fortawesome/free-brands-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MAX_AMOUNT } from '../config'
import Spinner from './Spinner'
import { trpc } from '../utils/trpc'
import { useToast } from './ui/use-toast'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { DollarSign } from 'lucide-react'
import { ProjectItem } from '../utils/types'
import Image from 'next/image'

type Props = {
  project: ProjectItem | undefined
}

const MembershipFormModal: React.FC<Props> = ({ project }) => {
  const session = useSession()
  const isAuthed = session.status === 'authenticated'

  const schema = z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      amount: z.coerce.number().min(1).max(MAX_AMOUNT),
      taxDeductible: z.enum(['yes', 'no']),
      recurring: z.enum(['yes', 'no']),
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
      amount: 100, // a trick to get trigger to work when amount is empty
      taxDeductible: 'no',
      recurring: 'no',
    },
    mode: 'all',
  })

  const taxDeductible = form.watch('taxDeductible')
  const recurring = form.watch('recurring')

  const payMembershipWithFiatMutation = trpc.donation.payMembershipWithFiat.useMutation()
  const payMembershipWithCryptoMutation = trpc.donation.payMembershipWithCrypto.useMutation()

  async function handleBtcPay(data: FormInputs) {
    if (!project) return

    try {
      const result = await payMembershipWithCryptoMutation.mutateAsync({
        projectSlug: project.slug,
        projectName: project.title,
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

    try {
      const result = await payMembershipWithFiatMutation.mutateAsync({
        projectSlug: project.slug,
        projectName: project.title,
        recurring: data.recurring === 'yes',
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

  if (!project) return <></>

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-8 py-4">
        <div className="flex items-center space-x-4">
          <Image
            alt={project.title}
            src={project.coverImage}
            width={96}
            height={96}
            objectFit="cover"
            className="rounded-xl"
          />
          <div className="flex flex-col">
            <h2 className="font-sans font-bold">{project.title}</h2>
            <h3 className="text-textgray font-sans">Annual membership</h3>
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

          <div className="flex flex-col space-y-3">
            <FormLabel>Amount</FormLabel>
            <span className="flex flex-row">
              <DollarSign />
              100.00
            </span>
          </div>

          <FormField
            control={form.control}
            name="taxDeductible"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Do you want your membership to be tax deductible? (US only)</FormLabel>
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

          <FormField
            control={form.control}
            name="recurring"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Do you want your membership payment to be recurring? (Fiat only)
                </FormLabel>
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

          <div className="mt-4 flex flex-wrap space-x-2">
            <Button
              type="button"
              onClick={form.handleSubmit(handleBtcPay)}
              disabled={
                !form.formState.isValid || form.formState.isSubmitting || recurring === 'yes'
              }
              className="grow basis-0"
            >
              {payMembershipWithCryptoMutation.isPending ? (
                <Spinner />
              ) : (
                <FontAwesomeIcon icon={faMonero} className="h-5 w-5" />
              )}
              Pay with Crypto
            </Button>

            <Button
              type="button"
              onClick={form.handleSubmit(handleFiat)}
              disabled={!form.formState.isValid || form.formState.isSubmitting}
              className="grow basis-0 bg-indigo-500 hover:bg-indigo-700"
            >
              {payMembershipWithFiatMutation.isPending ? (
                <Spinner />
              ) : (
                <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5" />
              )}
              Pay with Fiat
            </Button>
          </div>
        </form>
      </Form>

      {!isAuthed && <div className="w-full h-px bg-border" />}

      {!isAuthed && (
        <div className="flex flex-col items-center ">
          <p>Want to support more projects from now on?</p>

          <Button type="button" size="lg" variant="link">
            Create an account
          </Button>
        </div>
      )}
    </div>
  )
}

export default MembershipFormModal
