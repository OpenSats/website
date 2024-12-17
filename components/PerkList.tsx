import { StrapiPerk, StrapiPerkPopulated } from '../server/types'
import PerkCard from './PerkCard'
import { trpc } from '../utils/trpc'

type Props = {
  perks: StrapiPerkPopulated[]
}

const PerkList: React.FC<Props> = ({ perks }) => {
  return (
    <section className="bg-light items-left flex flex-col">
      <ul className="mx-auto grid max-w-5xl grid-cols-1 sm:mx-0 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks &&
          perks.map((perk, i) => (
            <li key={i} className="">
              <PerkCard perk={perk} />
            </li>
          ))}
      </ul>
    </section>
  )
}

export default PerkList
