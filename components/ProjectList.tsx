import Image from "next/image";
import waffledog from "../public/waffledog.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faC, faClose } from "@fortawesome/free-solid-svg-icons";
import ProjectCard from "./ProjectCard";
import Link from "next/link";
const ProjectList = ({ header = "Explore Projects" }) => {
  const projects = ["one", "two", "three"];
  return (

    <section className="p-4 md:p-8 bg-light flex flex-col items-center">
      <div className="flex justify-between items-center pb-8 w-full">
        <h1>{header}</h1>
        <div className="flex items-center">
          <Link href="/projects">View All</Link>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="ml-1 w-4 h-4 text-textgray cursor-pointer"
          />
        </div>
      </div>
      <ul className="grid md:grid-cols-3 gap-4 max-w-5xl">
        {projects.map((p, i) => (
          <li key={i} className="">
            <ProjectCard />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProjectList;
