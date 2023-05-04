import CreditItem, { CreditItemProps } from './CreditItem'

const Credits = () => {
  const macbookSketch = '/img/demo/sketch.png'

  // Team
  const abitcoinpersonPhoto = '/img/team/abitcoinperson.jpg'
  const dreadPhoto = '/img/team/dread.jpg'
  const elainePhoto = '/img/team/elaine.png'
  const j9RoemPhoto = '/img/team/j9Roem.png'
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

  const board: CreditItemProps[] = [
    { image: j9RoemPhoto, nym: 'J9Roem', link: 'https://twitter.com/J9Roem' },
    {
      image: dreadPhoto,
      nym: 'Dread',
      link: 'https://twitter.com/PoleVaultDream',
    },
    { image: elainePhoto, nym: 'Elaine', link: 'https://twitter.com/eiaine' },
    { image: gigiPhoto, nym: 'Gigi', link: 'https://twitter.com/dergigi' },
    { image: jamesPhoto, nym: 'James', link: 'https://twitter.com/jamesob' },
    {
      image: mattOdellPhoto,
      nym: 'Matt Odell',
      link: 'https://twitter.com/odell',
    },
    {
      image: niftyneiPhoto,
      nym: 'Niftynei',
      link: 'https://twitter.com/niftynei',
    },
    {
      image: abitcoinpersonPhoto,
      nym: 'Ben Price',
      link: 'https://twitter.com/abitcoinperson',
    },
    {
      image: nvkPhoto,
      nym: 'NVK',
      link: 'https://twitter.com/nvk',
    }
  ]

  const managing_director: CreditItemProps[] = [
    {
      image: h4rprPhoto,
      nym: 'Harper',
      link: 'https://twitter.com/harptheflarp',
    },
  ]

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
      nym: 'Coinkite' 
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
      link: 'https://twitter.com/harptheflarp',
      image: h4rprPhoto,
      nym: 'Harper',
      person: true,
    },
    { 
      link: 'https://www.ledger.com/', 
      image: ledgerLogo, 
      nym: 'Ledger' 
    },
    { 
      link: 'https://www.nodl.it/', 
      image: nodlLogo, 
      nym: 'nodl' 
    },
    {
      link: 'https://www.swanbitcoin.com/',
      image: swanBitcoinLogo,
      nym: 'Swan Bitcoin',
    },
    {
      link: 'https://www.lowtimepreferencefund.com/',
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
      nym: 'Voltage'
    },
    {
      link: 'https://zaprite.com',
      image: zapirte,
      nym: 'Zaprite'
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
    <section className="bg-black p-4 flex flex-col items-center">
      <h1 className="text-white my-4">Board</h1>
      <div className="credit container flex flex-wrap items-center justify-center mb-8">
        {board.map((b, i) => (
          <CreditItem key={i} image={b.image} link={b.link} nym={b.nym} />
        ))}
      </div>

      <h1 className="text-white my-4">Supporters</h1>
      <div className="credit container flex flex-wrap items-center justify-center mb-8">
        {supporters.filter((s) => (s.person)).map((s, i) => (
          <CreditItem key={i} image={s.image} link={s.link} nym={s.nym} />
        ))}
        {supporters.filter((s) => (!s.person)).map((s, i) => (
          <CreditItem key={i} image={s.image} link={s.link} nym={s.nym} />
        ))}
      </div>
    </section>
  )
}

export default Credits
