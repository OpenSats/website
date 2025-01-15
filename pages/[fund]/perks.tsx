import Head from 'next/head'
import { funds } from '../../utils/funds'
import { useFundSlug } from '../../utils/use-fund-slug'
import { trpc } from '../../utils/trpc'
import PerkList from '../../components/PerkList'

function Perks() {
  const fundSlug = useFundSlug()

  const getFundPerksQuery = trpc.perk.getFundPerks.useQuery({ fundSlug: fundSlug! })

  if (!fundSlug) return <></>

  return (
    <>
      <Head>
        <title>{funds[fundSlug].title} - Perks</title>
      </Head>

      <div className="w-full max-w-5xl mx-auto flex flex-col">
        <h1 className="text-3xl font-bold">Perks</h1>
        <p className="mb-4 pt-2 text-lg leading-7 text-gray-500">Exchange your points for perks</p>

        <PerkList perks={getFundPerksQuery.data || []} />
      </div>
    </>
  )
}

export default Perks
