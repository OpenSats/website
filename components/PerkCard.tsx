import Image from 'next/image'
import Link from 'next/link'

import { useFundSlug } from '../utils/use-fund-slug'
import { StrapiPerkPopulated } from '../server/types'
import { env } from '../env.mjs'
import { cn } from '../utils/cn'

const priceFormat = Intl.NumberFormat('en', { notation: 'standard', compactDisplay: 'long' })

export type Props = { perk: StrapiPerkPopulated }

const PerkCard: React.FC<Props> = ({ perk }) => {
  const fundSlug = useFundSlug()

  return (
    <Link href={`/${fundSlug}/perks/${perk.documentId}`}>
      <figure
        className={cn(
          'max-w-sm min-h-[360px] h-full space-y-2 flex flex-col rounded-lg border-b-4 bg-white cursor-pointer',
          fundSlug === 'monero' && 'border-monero',
          fundSlug === 'firo' && 'border-firo',
          fundSlug === 'privacyguides' && 'border-privacyguides',
          fundSlug === 'general' && 'border-primary'
        )}
      >
        <div className="flex h-52 w-full">
          <Image
            alt={perk.name}
            src={
              process.env.NODE_ENV !== 'production'
                ? env.NEXT_PUBLIC_STRAPI_URL + perk.images[0].formats.medium.url
                : perk.images[0].formats.medium.url
            }
            width={400}
            height={400}
            style={{ objectFit: 'contain' }}
            className="cursor-pointer rounded-t-xl bg-white"
          />
        </div>

        <figcaption className="p-5 flex flex-col grow space-y-4 justify-between">
          <div className="flex flex-col space-y-2">
            <div>
              <h2 className="font-bold">{perk.name}</h2>
            </div>

            <span className="line-clamp-3 text-gray-400">{perk.description}</span>

            <span className="font-bold">
              <span className="text-green-500">{priceFormat.format(perk.price)} points</span>
            </span>
          </div>
        </figcaption>
      </figure>
    </Link>
  )
}

export default PerkCard
