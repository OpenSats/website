import Link from './Link'
import Image from './Image'
import CreditItem, { CreditItemProps } from './CreditItem'

const Credits = () => {
  const macbookSketch = '/img/demo/sketch.png'

  // Team
  const abitcoinpersonPhoto = '/img/team/abitcoinperson.jpg'
  const dreadPhoto = '/img/team/dread.jpg'
  const elainePhoto = '/img/team/elaine.png'
  const j9Photo = '/img/team/j9.png'
  const jamesPhoto = '/img/team/james.jpg'
  const mattOdellPhoto = '/img/team/matt.jpg'
  const niftyneiPhoto = '/img/team/niftynei.jpg'
  const h4rprPhoto = '/img/team/h4rpr.png'
  const nvkPhoto = '/img/team/nvk.jpg'
  const gigiPhoto = '/img/team/gigi.jpg'

  // Supporters
  const andrewWBlairLogo = '/img/supporters/andrew-w-blair.jpg'
  const thebitcoincompanyLogo = '/img/supporters/tbc.png'
  const unchainedLogo = '/img/supporters/unchained.png'
  const bottlepayLogo = '/img/supporters/bottlepay.png'
  const btcPayServerLogo = '/img/supporters/btc-pay-server.png'
  const duxReserveLogoWithCastlenine =
    '/img/supporters/castlenine-dux-reserve.jpg'
  const coinkiteLogo = '/img/supporters/coinkite.png'
  const gregFossLogo = '/img/supporters/greg-foss.jpg'
  const jeremyRubinLogo = '/img/supporters/jeremy-rubin.gif'
  const johnPfefferLogo = '/img/supporters/john-pfeffer.jpg'
  const ledgerLogo = '/img/supporters/ledger.jpg'
  const nodlLogo = '/img/supporters/nodl.jpg'
  const swanBitcoinLogo = '/img/supporters/swan.png'
  const ten31Logo = '/img/supporters/ten31.jpg'
  const waffleDog = '/img/supporters/waffledog.jpg'
  const voltage = '/img/supporters/voltage.png'
  const zapirte = '/img/supporters/zaprite.png'

  const supporters: CreditItemProps[] = [
    {
      link: 'https://bottlepay.com/',
      image: bottlepayLogo,
      nym: 'Bottlepay',
    },
    {
      link: 'https://btcpayserver.org/',
      image: btcPayServerLogo,
      nym: 'BTCPay Server',
    },
    {
      link: 'https://twitter.com/castlenine_',
      image: duxReserveLogoWithCastlenine,
      nym: 'Castlenine',
      person: true,
    },
    {
      link: 'https://coinkite.com/',
      image: coinkiteLogo,
      nym: 'Coinkite',
    },
    {
      link: 'https://twitter.com/FossGregfoss',
      image: gregFossLogo,
      nym: 'Greg Foss',
      person: true,
    },
    {
      link: 'https://judica.org/',
      image: jeremyRubinLogo,
      nym: 'Jeremy Rubin',
      person: true,
    },
    {
      link: 'https://twitter.com/jlppfeffer',
      image: johnPfefferLogo,
      nym: 'John Pfeffer',
      person: true,
    },
    {
      link: 'https://www.ledger.com/',
      image: ledgerLogo,
      nym: 'Ledger',
    },
    {
      link: 'https://www.nodl.it/',
      image: nodlLogo,
      nym: 'nodl',
    },
    {
      link: 'https://www.swanbitcoin.com/',
      image: swanBitcoinLogo,
      nym: 'Swan Bitcoin',
    },
    {
      link: 'https://ten31.vc/',
      image: ten31Logo,
      nym: 'Ten31',
    },
    {
      link: 'https://www.poynerspruill.com/professionals/andy-blair/',
      image: andrewWBlairLogo,
      nym: 'Andrew W. Blair',
      person: true,
    },
    {
      link: 'https://paul.lol',
      image: waffleDog,
      nym: 'Paul',
      person: true,
    },
    {
      link: 'https://voltage.cloud/',
      image: voltage,
      nym: 'Voltage',
    },
    {
      link: 'https://zaprite.com',
      image: zapirte,
      nym: 'Zaprite',
    },
    {
      link: 'https://unchained.com',
      image: unchainedLogo,
      nym: 'Unchained',
    },
    {
      link: 'https://thebitcoincompany.com',
      image: thebitcoincompanyLogo,
      nym: 'The Bitcoin Company',
    },
  ]

  return (
    <div className="col-span-2 col-start-2 grid grid-cols-2 space-y-2 sm:gap-x-2 md:grid-cols-3 md:gap-x-8">
      {supporters
        .filter((s) => s.person)
        .map((s, i) => (
          <div className="items-left flex flex-col space-x-2 pt-8" key={i}>
            <Link href={s.link}>
              <Image
                src={s.image}
                alt={s.nym}
                width={120}
                height={120}
                className="h-36 w-36 rounded-full"
              />
            </Link>
          </div>
        ))}
      {supporters
        .filter((s) => !s.person)
        .map((s, i) => (
          <div className="items-left flex flex-col space-x-2 pt-8" key={i}>
            <Link href={s.link}>
              <Image
                src={s.image}
                alt={s.nym}
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

export default Credits
