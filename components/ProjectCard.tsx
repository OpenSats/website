import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import waffledog from "../public/waffledog.jpg";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
const ProjectCard = () => {
  return (
    <figure className="shadow-md p-8 bg-white space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <Image
          alt="waffledog"
          src={waffledog}
          width={160}
          height={160}
          className="rounded-full"
        />
        <h2 className="font-bold">Double-spend problem</h2>
      </div>
      <figcaption className="space-y-4">
        <p>
          Bitcoin ipsum dolor sit amet. Digital signature outputs, pizza
          hashrate money printer go brrrrr full node, timestamp server. Miner,
          sats Merkle Tree proof-of-work hard fork UTXO wallet halvening.
        </p>
        <div className="flex justify-end"></div>
        <div className="flex space-x-4">
          <Link href="#" passHref>
            <FontAwesomeIcon
              icon={faGithub}
              className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
            />
          </Link>
          <Link href="#" passHref>
            <FontAwesomeIcon
              icon={faTwitter}
              className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
            />
          </Link>
        </div>
        <div className="flex space-x-4 items-center justify-center pt-4">
          {/* <button>Details</button> */}
          <Link href="#">Details</Link>
          <button className="bg-primary">Donate</button>
        </div>
      </figcaption>
    </figure>
  );
};

export default ProjectCard;
