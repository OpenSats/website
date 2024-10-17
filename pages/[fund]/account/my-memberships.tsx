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

dayjs.extend(localizedFormat)

function MyMemberships() {
  const fundSlug = useFundSlug()

  // Conditionally render hooks should be ok in this case
  if (!fundSlug) return <></>

  const membershipListQuery = trpc.donation.membershipList.useQuery({ fundSlug })

  return (
    <>
      <Head>
        <title>Monero Fund - My Memberships</title>
      </Head>

      <div className="w-full max-w-5xl h-full mx-auto flex flex-col">
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
                <TableHead>Date</TableHead>
                <TableHead>Period End</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

export default MyMemberships
