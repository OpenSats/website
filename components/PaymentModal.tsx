import ReactModal from 'react-modal'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import DonationForm from './DonationForm'
import { Fund } from 'contentlayer/generated'

type ModalProps = {
  isOpen: boolean
  onRequestClose: () => void
  fund: Fund
}
const PaymentModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  fund,
}) => {
  if (!fund) {
    // We never see this yeah?
    return <div />
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-h-full w-full overflow-y-auto bg-white p-8 shadow-xl dark:bg-stone-800 sm:m-8 sm:rounded-xl"
      overlayClassName="inset-0 fixed bg-[rgba(0,_0,_0,_0.75)] flex items-center justify-center"
      appElement={
        typeof window === 'undefined'
          ? undefined
          : document?.getElementById('root') || undefined
      }
    >
      <div className="relative -mb-12 flex justify-end">
        <FontAwesomeIcon
          icon={faClose}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className="flex flex-col space-y-4 py-4">
        <div className="flex items-center gap-4">
          <Image
            alt={fund.title}
            src={fund.coverImage}
            width={96}
            height={96}
            objectFit="cover"
            className="rounded-xl"
          />
          <div className="flex flex-col">
            <h2 className="font-sans font-bold">{fund.title}</h2>
            <h3 className="text-textgray font-sans">Pledge your support</h3>
          </div>
        </div>
      </div>
      <DonationForm
        projectNamePretty={fund.title}
        btcpay={fund.btcpay}
        zaprite={fund.zaprite}
        store={fund.store}
      />
    </ReactModal>
  )
}

export default PaymentModal
