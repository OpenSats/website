import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ProjectItem } from "../utils/types";

const ProjectCard: React.FC<{ project: ProjectItem }> = ({ project }) => {
  console.log("project:", project)
  const { slug, title, summary, coverImage, git, twitter } = project;
  return (
    <figure className=" bg-white space-y-4 border border-lightgray rounded-xl">
      <div className="relative h-64">
        <Image
          alt={title}
          src={coverImage}
          layout="fill"
          objectFit="cover"
          objectPosition="50% 50%"
          className="rounded-t-xl border border-lightgray"
        />
      </div>

      <figcaption className="p-4 space-y-4">
        <h2>{title}</h2>
        <p>by{" "}
          <Link href={`https://github.com/${git}`} passHref>
            <a>@{git}</a>
          </Link>
        </p>
        <p className="prose">
          {summary}
        </p>
        <div className="flex justify-end"></div>
        <div className="flex space-x-4">
          <Link href={`https://github.com/${git}`} passHref>
            <FontAwesomeIcon
              icon={faGithub}
              className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
            />
          </Link>
          {twitter &&
            <Link href={`https://twitter.com/${twitter}`} passHref>
              <FontAwesomeIcon
                icon={faTwitter}
                className="w-[2rem] h-[2rem] hover:text-primary cursor-pointer"
              />
            </Link>
          }
        </div>
        <div className="flex space-x-4 items-center justify-center pt-4">
          <button className="bg-black basis-1/2">Donate</button>
          <div className="flex items-center justify-center basis-1/2">
            <Link href={`/projects/${slug}`} passHref>
              <a>View Details</a>
            </Link>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="ml-1 w-4 h-4 text-textgray cursor-pointer"
            />
          </div>
        </div>
      </figcaption>
    </figure >
  );
};

export default ProjectCard;
