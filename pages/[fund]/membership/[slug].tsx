import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { faMonero } from '@fortawesome/free-brands-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DollarSign } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { FundSlug } from '@prisma/client'
import { GetStaticPropsContext } from 'next'
import Image from 'next/image'
import { z } from 'zod'

import { MAX_AMOUNT } from '../../../config'
import Spinner from '../../../components/Spinner'
import { trpc } from '../../../utils/trpc'
import { useToast } from '../../../components/ui/use-toast'
import { Button } from '../../../components/ui/button'
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { ProjectItem } from '../../../utils/types'
import { getProjectBySlug, getProjects } from '../../../utils/md'
import { funds, fundSlugs } from '../../../utils/funds'
import Head from 'next/head'

type QueryParams = { fund: FundSlug; slug: string }
type Props = { project: ProjectItem } & QueryParams

function MembershipPage({ fund: fundSlug, project }: Props) {
  const session = useSession()
  const isAuthed = session.status === 'authenticated'

  const schema = z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      amount: z.coerce.number().min(1).max(MAX_AMOUNT),
      taxDeductible: z.enum(['yes', 'no']),
      recurring: z.enum(['yes', 'no']),
      givePointsBack: z.enum(['yes', 'no']),
      showDonorNameOnLeaderboard: z.enum(['yes', 'no']),
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
      email: '',
      name: '',
      amount: 100, // a trick to get trigger to work when amount is empty
      taxDeductible: 'no',
      recurring: 'no',
      givePointsBack: 'no',
      showDonorNameOnLeaderboard: 'no',
    },
    mode: 'all',
  })

  const taxDeductible = form.watch('taxDeductible')

  const payMembershipWithFiatMutation = trpc.donation.payMembershipWithFiat.useMutation()
  const payMembershipWithCryptoMutation = trpc.donation.payMembershipWithCrypto.useMutation()

  async function handleBtcPay(data: FormInputs) {
    if (!project) return
    if (!fundSlug) return

    try {
      const result = await payMembershipWithCryptoMutation.mutateAsync({
        projectSlug: project.slug,
        projectName: project.title,
        fundSlug,
        taxDeductible: data.taxDeductible === 'yes',
        givePointsBack: data.givePointsBack === 'yes',
        showDonorNameOnLeaderboard: data.showDonorNameOnLeaderboard === 'yes',
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
      const result = await payMembershipWithFiatMutation.mutateAsync({
        projectSlug: project.slug,
        projectName: project.title,
        fundSlug,
        recurring: data.recurring === 'yes',
        taxDeductible: data.taxDeductible === 'yes',
        givePointsBack: data.givePointsBack === 'yes',
        showDonorNameOnLeaderboard: data.showDonorNameOnLeaderboard === 'yes',
      })

      if (!result.url) throw new Error()

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
    <>
      <Head>
        <title>Membership to {project.title}</title>
      </Head>
      <div className="max-w-[540px] mx-auto p-6 space-y-6 rounded-xl bg-white">
        <div className="py-4 flex flex-col space-y-6">
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
              <h2 className="text-center sm:text-left font-semibold">
                Membership to {project.title}
              </h2>
              <h3 className="text-gray-500">Pledge your support</h3>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form className="flex flex-col gap-6">
            <div className="flex flex-col space-y-3">
              <FormLabel>Price</FormLabel>
              <span className="flex flex-row text-gray-700 font-semibold">
                <DollarSign className="text-primary" />
                100.00
              </span>
            </div>

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
              name="taxDeductible"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do you want your membership to be tax deductible? (US only)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4 text-gray-700"
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
                      className="flex flex-row space-x-4 text-gray-700"
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
              name="showDonorNameOnLeaderboard"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do you want your name to be displayed on the leaderboard?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4 text-gray-700"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="givePointsBack"
              render={({ field }) => (
                <FormItem className="space-y-3 leading-5">
                  <FormLabel>
                    Would you like to receive MAGIC Grants points back for your donation? The points
                    can be redeemed for various donation perks as a thank you for supporting our
                    mission.
                  </FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col"
                    >
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl className="flex-shrink-0">
                          <RadioGroupItem value="yes" />
                        </FormControl>

                        <FormLabel className="font-normal text-gray-700">
                          Yes, give me perks! This will reduce the donation amount by 10%, the
                          approximate value of the points when redeemed for goods/services.
                        </FormLabel>
                      </FormItem>

                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>

                        <FormLabel className="font-normal text-gray-700">
                          No, use my full contribution toward your mission.
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0">
              <Button
                type="button"
                onClick={form.handleSubmit(handleBtcPay)}
                disabled={!form.formState.isValid || form.formState.isSubmitting}
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
                  <Spinner className="fill-indigo-500" />
                ) : (
                  <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5" />
                )}
                Pay with Card
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}

export default MembershipPage

export async function getStaticPaths() {
  const projects = await getProjects()

  return {
    paths: [
      ...fundSlugs.map((fund) => `/${fund}/membership/${fund}`),
      ...projects.map((project) => `/${project.fund}/membership/${project.slug}`),
    ],
    fallback: true,
  }
}

export function getStaticProps({ params }: GetStaticPropsContext<QueryParams>) {
  if (params?.fund === params?.slug && params?.fund) {
    return { props: { ...params, project: funds[params.fund] } }
  }

  const project = getProjectBySlug(params?.slug!, params?.fund!)

  return { props: { ...params, project } }
}
