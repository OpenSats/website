import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import ProjectList from "../../components/ProjectList";
import PaymentModal from "../../components/PaymentModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faC, faClose } from "@fortawesome/free-solid-svg-icons";
import ProjectCard from "../../components/ProjectCard";
import { ProjectItem } from "../../utils/types";
import { getAllPosts } from "../../utils/md";
import markdownToHtml from "../../utils/markdownToHtml";

const AllProjects: NextPage<{ projects: ProjectItem[] }> = ({ projects }) => {
    const [modalOpen, setModalOpen] = useState(false);

    function closeModal() {
        setModalOpen(false);
    }

    // const projects = ["one", "two", "three", "one", "two", "three", "one", "two", "three"];

    return (
        <>
            <Head>
                <title>OpenSats | Projects</title>
            </Head>
            <section className="p-4 md:p-8 flex flex-col items-center">
                <div className="flex justify-between items-center pb-8 w-full">
                    <h1>Projects</h1>
                </div>
                <ul className="grid md:grid-cols-3 gap-4 max-w-5xl">
                    {projects.map((p, i) => (
                        <li key={i} className="">
                            <ProjectCard project={p} />
                        </li>
                    ))}
                </ul>
            </section>
            <PaymentModal isOpen={modalOpen} onRequestClose={closeModal} />
        </>
    );
};

export default AllProjects;

export async function getStaticProps({ params }: { params: any }) {
    const projects = getAllPosts(['slug', 'title', 'summary', 'website', 'coverImage', 'git', 'twitter'])

    return {
        props: {
            projects
        },
    }
}