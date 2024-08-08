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
import CustomLink from '../../components/CustomLink'

dayjs.extend(localizedFormat)

function MyMemberships() {
  const membershipListQuery = trpc.donation.membershipList.useQuery()

  return (
    <>
      <Head>
        <title>Monero Fund - My Memberships</title>
      </Head>

      <div className="w-full max-w-5xl mx-auto flex flex-col">
        <div className="flex flex-row justify-between">
          <h1 className="text-3xl font-bold mb-4">My Memberships</h1>
          {membershipListQuery.data?.billingPortalUrl && (
            <CustomLink
              href={membershipListQuery.data?.billingPortalUrl}
              aria-label="Manage Fiat Subscriptions"
            >
              Manage Fiat Subscriptions
            </CustomLink>
          )}
        </div>

        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Fund</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Period End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membershipListQuery.data?.memberships.map((membership) => (
              <TableRow key={membership.createdAt.toISOString()}>
                <TableCell className="font-medium">{membership.projectName}</TableCell>
                <TableCell>{membership.fund}</TableCell>
                <TableCell>{membership.stripeInvoiceId ? 'Fiat' : 'Monero'}</TableCell>
                <TableCell>{membership.stripeInvoiceId || membership.btcPayInvoiceId}</TableCell>
                <TableCell>{membership.status}</TableCell>
                <TableCell>{dayjs(membership.createdAt).format('lll')}</TableCell>
                <TableCell>{dayjs(membership.membershipExpiresAt).format('lll')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default MyMemberships
