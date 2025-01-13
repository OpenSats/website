import { useState } from 'react'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import Head from 'next/head'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from '../../../components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { trpc } from '../../../utils/trpc'
import { useFundSlug } from '../../../utils/use-fund-slug'
import { funds } from '../../../utils/funds'
import { Button } from '../../../components/ui/button'
import Spinner from '../../../components/Spinner'
import AttestationModalContent from '../../../components/AttestationModalContent'

dayjs.extend(localizedFormat)

function MyDonations() {
  const fundSlug = useFundSlug()
  const [attestationModalIsOpen, setAttestationModalIsOpen] = useState(false)
  const [attestation, setAttestation] = useState<{ message: string; signature: string } | null>()

  // Conditionally render hooks should be ok in this case
  if (!fundSlug) return <></>

  const donationListQuery = trpc.donation.donationList.useQuery({ fundSlug })
  const getDonationAttestationMutation = trpc.donation.getDonationAttestation.useMutation()

  async function getAttestation(donationId: string) {
    const _attestation = await getDonationAttestationMutation.mutateAsync({ donationId })
    setAttestation(_attestation)
    setAttestationModalIsOpen(true)
  }

  return (
    <>
      <Head>
        <title>{funds[fundSlug].title} - My Donations</title>
      </Head>

      <div className="w-full max-w-5xl mx-auto flex flex-col">
        <h1 className="text-3xl font-bold mb-4">My Donations</h1>

        <div className="w-full flex overflow-x-auto grow">
          <Table className="min-w-[700px] grow">
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donationListQuery.data?.map((donation) => (
                <TableRow key={donation.createdAt.toISOString()}>
                  <TableCell>{donation.projectName}</TableCell>
                  <TableCell>{donation.btcPayInvoiceId ? 'Crypto' : 'Fiat'}</TableCell>
                  <TableCell>${donation.grossFiatAmount}</TableCell>
                  <TableCell>{dayjs(donation.createdAt).format('lll')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={getDonationAttestationMutation.isPending}
                      onClick={() => getAttestation(donation.id)}
                    >
                      {getDonationAttestationMutation.isPending && <Spinner />}
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

export default MyDonations
