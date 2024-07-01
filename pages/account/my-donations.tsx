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
import { Button } from '../../components/ui/button'
import CustomLink from '../../components/CustomLink'

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
        <div className="flex flex-row justify-between">
          <h1 className="text-3xl font-bold mb-4">My Donations</h1>
          {!!donationListQuery.data?.billingPortalUrl && (
            <CustomLink href={donationListQuery.data.billingPortalUrl}>
              Manage Subscriptions
            </CustomLink>
          )}
        </div>

        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Fund</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Subscription End</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donationListQuery.data?.donations.map((donation) => (
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
                <TableCell>
                  {donation.stripePaymentStatus ||
                    donation.stripeSubscriptionStatus ||
                    donation.btcPayStatus}
                </TableCell>
                <TableCell>{dayjs(donation.createdAt).format('lll')}</TableCell>
                <TableCell>
                  {donation.subscriptionCancelAt
                    ? dayjs(donation.subscriptionCancelAt).format('lll')
                    : '-'}
                </TableCell>
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
