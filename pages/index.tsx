import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import ProjectList from "../components/ProjectList";
import PaymentModal from "../components/PaymentModal";
import Link from "next/link";
import Image from "next/image";
import unicorn from "/public/heroes/unicorn.png"

const Home: NextPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  function closeModal() {
    setModalOpen(false);
  }

  return (
    <>
      <Head>
        <title>OpenSats</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <section className="flex py-8 items-center">
          <div className="p-4 md:p-8 space-y-8 basis-2/3 max-w-4xl">
            <h1>
              Support contributors to Bitcoin and other free and open source
              projects
            </h1>
            <p className="text-textgray">We help you find and support open-source Bitcoin projects - helping create a better tomorrow, today.</p>
            <button role={"button"} onClick={() => setModalOpen(true)}>
              Donate to Bitcoin
            </button>
            <p>Are you an open source contributor? <a href="#">Apply for your project to be listed.</a></p>
          </div>
          <div className="flex-1 flex justify-center">

            <Image width={388} height={388} src={unicorn} alt="Unicorn" />
          </div>
        </section>
        <ProjectList />
      </main>
      <PaymentModal isOpen={modalOpen} onRequestClose={closeModal} />
    </>
  );
};

export default Home;
