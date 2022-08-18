import ReactModal from 'react-modal'
import Image from 'next/image'
import waffledog from '../public/waffledog.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import DonationForm from './DonationForm'
import { ProjectItem } from '../utils/types'

type ModalProps = {
  isOpen: boolean
  onRequestClose: () => void
  project: ProjectItem | undefined
}
const PaymentModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  project,
}) => {
  if (!project) {
    // We never see this yeah?
    return <div />
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="p-8 bg-white shadow-xl overflow-y-auto max-h-full sm:rounded-xl w-full sm:m-8"
      overlayClassName="inset-0 fixed bg-[rgba(0,_0,_0,_0.75)] flex items-center justify-center"
      appElement={
        typeof window === 'undefined'
          ? undefined
          : document?.getElementById('root') || undefined
      }
    >
      <div className="flex justify-end relative -mb-12">
        <FontAwesomeIcon
          icon={faClose}
          className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className="flex flex-col space-y-4 py-4">
        <div className="flex gap-4 items-center">
          <Image
            alt={project.title}
            src={project.coverImage}
            width={96}
            height={96}
            objectFit="cover"
            className="rounded-xl"
          />
          <div className="flex flex-col">
            <h2 className="font-sans font-bold">{project.title}</h2>
            <h3 className="font-sans text-textgray">Pledge your support</h3>
          </div>
        </div>
      </div>
      <DonationForm
        projectNamePretty={project.title}
        projectSlug={project.slug}
        zaprite={project.zaprite}
      />
    </ReactModal>
  )
}

export default PaymentModal
