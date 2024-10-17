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
import { useFundSlug } from '../../../utils/use-fund-slug'

dayjs.extend(localizedFormat)

const donationTypePretty = {
  one_time: 'One-time',
  recurring: 'Recurring',
}

function MyDonations() {
  const fundSlug = useFundSlug()

  // Conditionally render hooks should be ok in this case
  if (!fundSlug) return <></>

  const donationListQuery = trpc.donation.donationList.useQuery({ fundSlug })

  return (
    <>
      <Head>
        <title>Monero Fund - My Donations</title>
      </Head>

      <div className="w-full max-w-5xl h-full mx-auto flex flex-col">
        <h1 className="text-3xl font-bold mb-4">My Donations</h1>

        <div className="w-full flex overflow-x-auto grow">
          <Table className="min-w-[700px] grow">
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donationListQuery.data?.map((donation) => (
                <TableRow key={donation.createdAt.toISOString()}>
                  <TableCell>{donation.projectName}</TableCell>
                  <TableCell>{donation.btcPayInvoiceId ? 'Crypto' : 'Fiat'}</TableCell>
                  <TableCell>${donation.grossFiatAmount}</TableCell>
                  <TableCell>{dayjs(donation.createdAt).format('lll')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

export default MyDonations
