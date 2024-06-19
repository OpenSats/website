import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { trpc } from '../../utils/trpc'
import Head from 'next/head'

dayjs.extend(localizedFormat)

const donationTypePretty = {
  one_time: 'One-time',
  recurring: 'Recurring',
}

function MyDonations() {
  const donationListQuery = trpc.donation.donationList.useQuery()

  return (
    <>
      <Head>
        <title>Monero Fund - My Donations</title>
      </Head>
      <div className="w-full max-w-5xl mx-auto flex flex-col">
        <h1 className="text-3xl font-bold mb-4">My Donations</h1>

        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Fund</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donationListQuery.data?.map((donation) => (
              <TableRow key={donation.createdAt.toISOString()}>
                <TableCell className="font-medium">
                  {donation.projectName}
                </TableCell>
                <TableCell>{donation.fundName}</TableCell>
                <TableCell>{donationTypePretty[donation.type]}</TableCell>
                <TableCell>
                  {donation.method.charAt(0).toUpperCase() +
                    donation.method.slice(1)}
                </TableCell>
                <TableCell>{dayjs(donation.createdAt).format('lll')}</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right">${donation.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default MyDonations
