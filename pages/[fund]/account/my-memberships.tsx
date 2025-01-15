import { useState } from 'react'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import Head from 'next/head'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { trpc } from '../../../utils/trpc'
import CustomLink from '../../../components/CustomLink'
import { useFundSlug } from '../../../utils/use-fund-slug'
import { funds } from '../../../utils/funds'
import { Button } from '../../../components/ui/button'
import Spinner from '../../../components/Spinner'
import { Dialog } from '../../../components/ui/dialog'
import AttestationModalContent from '../../../components/AttestationModalContent'

dayjs.extend(localizedFormat)

function MyMemberships() {
  const fundSlug = useFundSlug()
  const [attestationModalIsOpen, setAttestationModalIsOpen] = useState(false)
  const [attestation, setAttestation] = useState<{ message: string; signature: string } | null>()

  const membershipListQuery = trpc.donation.membershipList.useQuery(
    { fundSlug: fundSlug! },
    { enabled: !!fundSlug }
  )

  const getMembershipAttestationMutation = trpc.donation.getMembershipAttestation.useMutation()

  async function getAttestation(donationId?: string, subscriptionId?: string) {
    const _attestation = await getMembershipAttestationMutation.mutateAsync({
      donationId,
      subscriptionId,
    })
    setAttestation(_attestation)
    setAttestationModalIsOpen(true)
  }

  if (!fundSlug) return <></>

  return (
    <>
      <Head>
        <title>{funds[fundSlug].title} - My Memberships</title>
      </Head>

      <div className="w-full max-w-5xl mx-auto flex flex-col">
        <div className="flex flex-row justify-between">
          <h1 className="text-3xl font-bold mb-4">My Memberships</h1>
          {membershipListQuery.data?.billingPortalUrl && (
            <CustomLink
              href={membershipListQuery.data?.billingPortalUrl}
              aria-label="Manage Fiat Subscriptions"
            >
              Manage Recurring Memberships
            </CustomLink>
          )}
        </div>

        <div className="w-full flex overflow-x-auto grow">
          <Table className="min-w-[700px] grow">
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Period Start</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membershipListQuery.data?.memberships.map((membership) => (
                <TableRow key={membership.createdAt.toISOString()}>
                  <TableCell>{membership.projectName}</TableCell>
                  <TableCell>{membership.btcPayInvoiceId ? 'Crypto' : 'Fiat'}</TableCell>
                  <TableCell>{membership.stripeSubscriptionId ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{dayjs(membership.createdAt).format('lll')}</TableCell>
                  <TableCell>{dayjs(membership.membershipExpiresAt).format('lll')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={getMembershipAttestationMutation.isPending}
                      onClick={() =>
                        getAttestation(
                          membership.stripeSubscriptionId ? undefined : membership.id,
                          membership.stripeSubscriptionId || undefined
                        )
                      }
                    >
                      {getMembershipAttestationMutation.isPending && <Spinner />}
                      Get Attestation
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={attestationModalIsOpen} onOpenChange={setAttestationModalIsOpen}>
        <AttestationModalContent
          message={attestation?.message}
          signature={attestation?.signature}
          closeModal={() => setAttestationModalIsOpen(false)}
        />
      </Dialog>
    </>
  )
}

export default MyMemberships
