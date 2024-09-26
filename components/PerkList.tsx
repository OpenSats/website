import { StrapiPerk } from '../server/types'
import PerkCard from './PerkCard'
import { trpc } from '../utils/trpc'

type Props = {
  perks: StrapiPerk[]
}

const PerkList: React.FC<Props> = ({ perks }) => {
  const getBalanceQuery = trpc.perk.getBalance.useQuery()

  return (
    <section className="bg-light items-left flex flex-col">
      <ul className="mx-auto grid max-w-5xl grid-cols-1 sm:mx-0 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks &&
          perks.map((perk, i) => (
            <li key={i} className="">
              <PerkCard perk={perk} balance={getBalanceQuery.data || 0} />
            </li>
          ))}
      </ul>
    </section>
  )
}

export default PerkList
