import Link from './Link'
import Image from './Image'
import CreditItem, { CreditItemProps } from './CreditItem'

const Volunteers = () => {
  const lucas = '/img/volunteers/lucas.jpg'
  const gabe = '/img/volunteers/gabe.jpg'
  const arvin = '/img/volunteers/arvin.jpg'
  const dez = '/img/volunteers/dez.jpg'

  const volunteers: CreditItemProps[] = [
    {
      link: 'https://njump.me/npub176mj8c5pa6pxlmm8syv4uhmz0n8934w0pfnfddgawhycqcue69esr3qzt2',
      image: lucas,
      nym: 'Lucas Guimaraes',
    },
    {
      link: 'https://njump.me/npub1p6tshz5f0vgskx6p8prusfud0ksxl78fwh8tj4s08upcrsq50nfq62ax3q',
      image: gabe,
      nym: 'Gabe',
    },
    {
      link: 'https://bitcoin.org/bitcoin.pdf',
      image: arvin,
      nym: 'Arvin',
    },
    {
      link: 'https://njump.me/npub1lwwszsyje89zaww8g8rqyzzjzm25lkzeqv4qsfmhpgazke5xxx5q7p62z6',
      image: dez,
      nym: 'Dez',
    },
  ]

  return (
    <div className="col-span-2 col-start-2 grid grid-cols-2 space-y-2 sm:gap-x-2 md:grid-cols-3 md:gap-x-8">
      {volunteers.map((v, i) => (
        <div className="items-left flex flex-col space-x-2 pt-8" key={i}>
          <Link href={v.link}>
            <Image
              src={v.image}
              alt={v.nym}
              title={v.nym}
              width={120}
              height={120}
              className="h-36 w-36 rounded-full"
            />
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Volunteers
