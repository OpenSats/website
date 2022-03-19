import { useState } from "react";
import ReactModal from "react-modal";
import Image from "next/image";
import waffledog from "../public/waffledog.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faC, faClose } from "@fortawesome/free-solid-svg-icons";
import DonationSteps from "./DonationSteps";

type ModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};
const PaymentModal: React.FC<ModalProps> = ({ isOpen, onRequestClose }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="p-4 bg-white shadow-xl overflow-y-scroll max-h-full"
      overlayClassName="inset-0 fixed bg-[rgba(0,_0,_0,_0.75)] flex items-center justify-center"
      appElement={
        typeof window === "undefined"
          ? undefined
          : document?.getElementById("root") || undefined
      }
    >
      <div className="flex justify-end">
        <FontAwesomeIcon
          icon={faClose}
          className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className=" xl:flex">
        <div className="flex flex-col items-center space-y-4 p-4">
          <Image
            alt="waffledog"
            src={waffledog}
            width={160}
            height={160}
            className="rounded-full"
          />
          <h2 className="font-bold">Double-spend problem</h2>
        </div>
        <div className="flex flex-col p-4 space-y-4">
          <h2>You&apos;re contributing to:</h2>
          <h1>Double-spend problem</h1>
          <hr></hr>
          <DonationSteps />
        </div>
      </div>
    </ReactModal>
  );
};

export default PaymentModal;
