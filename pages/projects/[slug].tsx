import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import { getPostBySlug, getAllPosts } from '../../utils/md'
import markdownToHtml from '../../utils/markdownToHtml'
import markdownStyles from '../../components/markdown-styles.module.css'
import Image from 'next/image'
import ProjectList from '../../components/ProjectList'
import BackToProjects from '../../components/BackToProjects'
import { ProjectItem } from '../../utils/types'
import { NextPage } from 'next/types'
import { useState } from 'react'
import PaymentModal from '../../components/PaymentModal'
import Link from 'next/link'
import ShareButtons from '../../components/ShareButtons'

type SingleProjectPageProps = {
  project: ProjectItem
  projects: ProjectItem[]
}

const Project: NextPage<SingleProjectPageProps> = ({ project, projects }) => {
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal() {
    console.log('opening single project modal...')
    setSelectedProject(project)
    setModalOpen(true)
  }

  const {
    slug,
    title,
    summary,
    coverImage,
    git,
    twitter,
    content,
    nym,
    zaprite,
    website,
    personalTwitter,
    raised
  } = project

  if (!router.isFallback && !slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <>
      <div className="flex flex-col items-center">
        <div className={"h-[15rem] w-full relative bg-gradient-to-b from-white to-gray-200"}>
          <Image
            alt={title}
            src={coverImage}
            layout="fill"
            objectFit="contain"
            objectPosition="50% 50%"
          />
        </div>

        <div className="flex w-full p-4 py-8 md:px-8">
          <BackToProjects />
        </div>
        <article className="px-4 md:px-8 pb-8 lg:flex lg:flex-row-reverse lg:items-start">
          <aside className="p-4 bg-light rounded-xl flex lg:flex-col gap-4 min-w-[20rem] justify-between mb-8">
            {raised && <div>
              <h5>Raised</h5>
              <h4>{raised} BTC</h4>
            </div>
            }
            <button onClick={openPaymentModal}>Donate</button>
          </aside>

          <div className={markdownStyles['markdown']}>
            <Link href={website}>
              <a className='!no-underline'>
                <h1>{title}</h1>
              </a>
            </Link>
            <p>{summary}</p>

            <p>
              by{' '}
              <Link href={`https://twitter.com/${personalTwitter || twitter}`} passHref>
                <a>{nym}</a>
              </Link>
            </p>
            <ShareButtons project={project} />
            <hr />
            {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
          </div>
        </article>
      </div>
      <ProjectList
        projects={projects}
        exclude={slug}
        header="You might also like..."
        openPaymentModal={openPaymentModal}
      />
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}

export default Project

export async function getStaticProps({ params }: { params: any }) {
  const post = getPostBySlug(params.slug)

  const projects = getAllPosts()

  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      project: {
        ...post,
        content,
      },
      projects,
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts()

  return {
    paths: posts.map((post) => {
      return {
        params: {
          project: post,
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}
