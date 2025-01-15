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
import { funds } from '../../../utils/funds'

dayjs.extend(localizedFormat)

function PointHistory() {
  const fundSlug = useFundSlug()

  const getHistoryQuery = trpc.perk.getHistory.useQuery()

  if (!fundSlug) return <></>

  return (
    <>
      <Head>
        <title>{funds[fundSlug!].title} - Point History</title>
      </Head>

      <div className="w-full max-w-5xl mx-auto flex flex-col">
        <h1 className="text-3xl font-bold mb-4">Points History</h1>

        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Earned/spent</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Project donated to</TableHead>
              <TableHead>Perk purchased</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getHistoryQuery.data?.map((pointHistory) => (
              <TableRow key={pointHistory.createdAt}>
                {Number(pointHistory.balanceChange) > 0 ? (
                  <TableCell className="text-green-500">+{pointHistory.balanceChange}</TableCell>
                ) : (
                  <TableCell className="text-red-500">{pointHistory.balanceChange}</TableCell>
                )}

                <TableCell>{pointHistory.balance}</TableCell>
                <TableCell>{pointHistory.donationProjectName || '-'}</TableCell>
                <TableCell>{pointHistory.perk?.name || '-'}</TableCell>
                <TableCell>{dayjs(pointHistory.createdAt).format('lll')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default PointHistory
