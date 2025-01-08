import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import Head from 'next/head'
import { useEffect, useState } from 'react'

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
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { CopyIcon } from 'lucide-react'
import { toast } from '../../../components/ui/use-toast'

dayjs.extend(localizedFormat)

function MyDonations() {
  const fundSlug = useFundSlug()
  const [attestationModalIsOpen, setAttestationModalIsOpen] = useState(false)
  const [attestation, setAttestation] = useState<{ message: string; signature: string } | null>()

  // Conditionally render hooks should be ok in this case
  if (!fundSlug) return <></>

  const donationListQuery = trpc.donation.donationList.useQuery({ fundSlug })
  const getAttestationMutation = trpc.donation.getAttestation.useMutation()

  async function getAttestation(donationId: string) {
    const _attestation = await getAttestationMutation.mutateAsync({ donationId })
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
                      disabled={getAttestationMutation.isPending}
                      onClick={() => getAttestation(donation.id)}
                    >
                      {getAttestationMutation.isPending && <Spinner />}
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

type AttestationModalContentProps = {
  message?: string
  signature?: string
  closeModal: () => void
}

function AttestationModalContent({ message, signature, closeModal }: AttestationModalContentProps) {
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)

    toast({
      title: 'Success',
      description: 'Copied to clipboard!',
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Attestation</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <Label>Message</Label>
          <Textarea className="h-56 font-mono" readOnly value={message} />
          <Button
            size="sm"
            variant="light"
            className="ml-auto"
            onClick={() => copyToClipboard(message!)}
          >
            <CopyIcon size={20} /> Copy
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Signature</Label>
          <Textarea className="h-20 font-mono" readOnly value={signature} />
          <Button
            size="sm"
            variant="light"
            className="ml-auto"
            onClick={() => copyToClipboard(signature!)}
          >
            <CopyIcon size={20} /> Copy
          </Button>
        </div>
      </div>

      {/* <DialogFooter>
        <Button className="self-end" onClick={closeModal}>
          Done
        </Button>
      </DialogFooter> */}
    </DialogContent>
  )
}
