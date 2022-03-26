import { useState } from "react";
import ReactModal from "react-modal";
import Image from "next/image";
import waffledog from "../public/waffledog.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faC, faClose } from "@fortawesome/free-solid-svg-icons";
import DonationSteps from "./DonationSteps";
import DonationForm from "./DonationForm";

type ModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};
const PaymentModal: React.FC<ModalProps> = ({ isOpen, onRequestClose }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="p-4 bg-white shadow-xl overflow-y-auto max-h-full rounded-xl w-full m-4"
      overlayClassName="inset-0 fixed bg-[rgba(0,_0,_0,_0.75)] flex items-center justify-center"
      appElement={
        typeof window === "undefined"
          ? undefined
          : document?.getElementById("root") || undefined
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
            alt="waffledog"
            src={waffledog}
            width={96}
            height={96}
            className="rounded-xl"
          />
          <div className="flex flex-col">
            <h2 className="font-sans font-bold">Double-spend problem</h2>
            <h3 className="font-sans text-textgray">Plege your support</h3>
          </div>
        </div>
      </div>
      <DonationForm />
    </ReactModal>
  );
};

export default PaymentModal;
