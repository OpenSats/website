import Image from "next/image";
import waffledog from "../public/waffledog.jpg";
import ProjectCard from "./ProjectCard";
const ProjectList = () => {
  const projects = ["one", "two", "three", "four"];
  return (
    <section className="p-8 bg-gray-100">
      <div className="flex justify-between items-center pb-8">
        <h1>Projects</h1>
        <a href="#">View All</a>
      </div>
      {/* <ul className="flex flex-col items-center xl:flex-row justify-center"> */}
      <ul className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
