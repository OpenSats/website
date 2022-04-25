import CreditItem, { CreditItemProps } from './CreditItem'

const Credits = () => {
  const macbookSketch = '/img/demo/sketch.png'

  // Team
  const abitcoinpersonPhoto = '/img/team/abitcoinperson.jpg'
  const dreadPhoto = '/img/team/dread.jpg'
  const elainePhoto = '/img/team/elaine.png'
  const j9RoemPhoto = '/img/team/j9Roem.png'
  const jamesPhoto = '/img/team/james.jpg'
  const k3tanPhoto = '/img/team/k3tan.png'
  const mattOdellPhoto = 'https://pbs.twimg.com/profile_images/1421584695746338819/Z_7ZfAeP_400x400.jpg'
  const niftyneiPhoto = '/img/team/niftynei.jpg'
  const udiPhoto = '/img/team/udi.jpg'

  // Supporters
  const andrewWBlairLogo = '/img/supporters/andrew-w-blair.jpg'
  const thebitcoincompanyLogo = '/img/supporters/thebitcoincompany.jpg'
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
  const silvergateBankLogo = '/img/supporters/silvergate-bank.png'
  const swanBitcoinLogo = '/img/supporters/swan.jpg'
  const ten31Logo = '/img/supporters/ten31.jpg'
  const waffleDog = '/img/supporters/waffledog.jpg'
  const voltage = '/img/supporters/voltage.png'

  const board: CreditItemProps[] = [
    { image: j9RoemPhoto, nym: 'J9Roem', link: 'https://twitter.com/J9Roem' },
    {
      image: dreadPhoto,
      nym: 'Dread',
      link: 'https://twitter.com/PoleVaultDream',
    },
    { image: elainePhoto, nym: 'Elaine', link: 'https://twitter.com/eiaine' },
    { image: jamesPhoto, nym: 'James', link: 'https://twitter.com/jamesob' },
    { image: k3tanPhoto, nym: 'K3tan', link: 'https://twitter.com/_k3tan' },
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
    { image: udiPhoto, nym: 'Udi', link: 'https://twitter.com/udiwertheimer' },
    {
      image: abitcoinpersonPhoto,
      nym: 'Ben Price',
      link: 'https://twitter.com/abitcoinperson',
    },
  ]

  const supporters: CreditItemProps[] = [
    { link: 'https://bottlepay.com/', image: bottlepayLogo, nym: 'Bottlepay' },
    {
      link: 'https://btcpayserver.org/',
      image: btcPayServerLogo,
      nym: 'BTCPay Server',
    },
    {
      link: 'https://twitter.com/castlenine_',
      image: duxReserveLogoWithCastlenine,
      nym: 'Castlenine',
    },
    { link: 'https://coinkite.com/', image: coinkiteLogo, nym: 'Coinkite' },
    {
      link: 'https://twitter.com/FossGregfoss',
      image: gregFossLogo,
      nym: 'Greg Foss',
    },
    {
      link: 'https://judica.org/',
      image: jeremyRubinLogo,
      nym: 'Jeremy Rubin',
    },
    {
      link: 'https://twitter.com/jlppfeffer',
      image: johnPfefferLogo,
      nym: 'John Pfeffer',
    },
    { link: 'https://www.ledger.com/', image: ledgerLogo, nym: 'Ledger' },
    { link: 'https://www.nodl.it/', image: nodlLogo, nym: 'nodl' },
    {
      link: 'https://silvergate.com/',
      image: silvergateBankLogo,
      nym: 'Silvergate Bank',
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
      link: 'https://www.manningfulton.com/people/attorneys/andrew-w-blair/',
      image: andrewWBlairLogo,
      nym: 'Andrew W. Blair',
    },
    {
      link: 'https://paul.lol',
      image: waffleDog,
      nym: 'Paul'
    },
    {
      link: 'https://voltage.cloud/',
      image: voltage,
      nym: 'Voltage'
    },
    {
      link: 'https://twitter.com/thebtccompany',
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
      <div className="credit container flex flex-wrap items-center justify-center">
        {supporters.map((s, i) => (
          <CreditItem key={i} image={s.image} link={s.link} nym={s.nym} />
        ))}
      </div>
    </section>
  )
}

export default Credits
