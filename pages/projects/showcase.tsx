import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import ProjectCard from '../../components/ProjectCard'
import { allProjects } from 'contentlayer/generated'
import { Project } from 'contentlayer/generated'
import { isNotOpenSatsProject } from '../funds'
import Link from '@/components/Link'

const ProjectShowcase: NextPage<{ projects: Project[] }> = ({ projects }) => {
  const [sortedProjects, setSortedProjects] = useState<Project[]>()

  useEffect(() => {
    setSortedProjects(
      projects.filter(isNotOpenSatsProject).sort(() => 0.5 - Math.random())
    )
  }, [projects])

  return (
    <>
      <Head>
        <title>OpenSats | Project Showcase</title>
      </Head>
      <section className="flex flex-col p-4 md:p-8">
        <div className="flex w-full items-center justify-between pb-8">
          <h1 id="funds">Project Showcase</h1>
        </div>
        <ul className="grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {sortedProjects &&
            sortedProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard
                  slug={`/projects/${p.slug}`}
                  title={p.title}
                  summary={p.summary}
                  coverImage={p.coverImage}
                  nym={p.nym}
                  tags={p.tags}
                />
              </li>
            ))}
        </ul>
      </section>
      <div className="flex justify-end pt-4 text-base font-medium leading-6">
        <Link
          href="/tags/grants"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          aria-label="All Grants"
        >
          All Grants &rarr;
        </Link>
      </div>
    </>
  )
}

export default ProjectShowcase

export async function getStaticProps() {
  const projects = allProjects

  return {
    props: {
      projects,
    },
  }
}
