import Image from 'next/image'

export type CreditItemProps = {
  link: string
  image: string
  nym: string
  person?: boolean
}
const CreditItem: React.FC<CreditItemProps> = ({ image, nym, link }) => {
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <div className="flex flex-col items-center gap-2 p-4">
        <Image
          width={192}
          height={192}
          src={image}
          alt={nym}
          className="rounded border border-white"
        />
        <h3 className="font-mono text-xl text-white">{nym}</h3>
      </div>
    </a>
  )
}

export default CreditItem
