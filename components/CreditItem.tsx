import Image from "next/image"

export type CreditItemProps = {
    link: string;
    image: string;
    nym: string;
}
const CreditItem: React.FC<CreditItemProps> = ({ image, nym, link }) => {
    return (
        <a href={link} target="_blank" rel="noreferrer">
            <div className="p-4 flex flex-col items-center gap-2">
                <Image width={192} height={192} src={image} alt={nym} className="border border-white rounded" />
                <h3 className="text-white font-mono text-xl">{nym}</h3>
            </div>
        </a>

    )
}

export default CreditItem