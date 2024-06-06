import { useState } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next/types'
import ErrorPage from 'next/error'
import Image from 'next/image'
import xss from 'xss'

import { ProjectItem, Stats } from '../../utils/types'
import { getPostBySlug, getAllPosts } from '../../utils/md'
import markdownToHtml from '../../utils/markdownToHtml'
import {
  fetchPostJSON,
  fetchGetJSONAuthedBTCPay,
  fetchGetJSONAuthedStripe,
} from '../../utils/api-helpers'
import PaymentModal from '../../components/PaymentModal'
import PageHeading from '../../components/PageHeading'
import SocialIcon from '../../components/social-icons'
import Progress from '../../components/Progress'

type SingleProjectPageProps = {
  project: ProjectItem
  projects: ProjectItem[]
  stats: Stats
}

const Project: NextPage<SingleProjectPageProps> = ({
  project,
  projects,
  stats,
}) => {
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
    website,
    personalTwitter,
    personalWebsite,
    goal,
    isFunded,
  } = project

  function formatBtc(bitcoin: number) {
    if (bitcoin > 0.1) {
      return `₿ ${bitcoin.toFixed(3) || 0.0}`
    } else {
      return `${Math.floor(bitcoin * 100000000).toLocaleString()} sats`
    }
  }

  function formatUsd(dollars: number): string {
    if (dollars == 0) {
      return '$0'
    } else if (dollars / 1000 > 1) {
      return `$${Math.round(dollars / 1000)}k+`
    } else {
      return `$${dollars.toFixed(0)}`
    }
  }

  if (!router.isFallback && !slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <PageHeading project={project}>
          <div className="flex flex-col items-center space-x-2 pt-8 xl:block">
            <Image
              src={coverImage}
              alt="avatar"
              width={300}
              height={300}
              className="h-72 w-72 mx-auto object-contain xl:hidden"
            />

            <div className="space-y-4">
              <h1 className="mb-4 font-bold">Raised</h1>

              <Progress
                percent={Math.floor(
                  ((stats[slug].xmr.totaldonationsinfiat +
                    stats[slug].btc.totaldonationsinfiat +
                    stats[slug].usd.totaldonationsinfiat) /
                    goal) *
                    100
                )}
              />

              <ul className="font-semibold space-y-1">
                <li className="flex items-center space-x-1">
                  <span className="text-green-500 text-xl">{`${formatUsd(stats[slug].xmr.totaldonationsinfiat + stats[slug].btc.totaldonationsinfiat + stats[slug].usd.totaldonationsinfiat)}`}</span>{' '}
                  <span className="font-normal text-sm text-gray">
                    in{' '}
                    {stats[slug].xmr.numdonations +
                      stats[slug].btc.numdonations +
                      stats[slug].usd.numdonations}{' '}
                    donations total
                  </span>
                </li>
                <li>
                  {stats[slug].xmr.totaldonations} XMR{' '}
                  <span className="font-normal text-sm text-gray">
                    in {stats[slug].xmr.numdonations} {''}
                    donations
                  </span>
                </li>
                <li>
                  {stats[slug].btc.totaldonations} BTC{' '}
                  <span className="font-normal text-sm text-gray">
                    in {stats[slug].btc.numdonations} {''}
                    donations
                  </span>
                </li>
                <li>
                  {`${formatUsd(stats[slug].usd.totaldonations)}`} Fiat{' '}
                  <span className="font-normal text-sm text-gray">
                    in {stats[slug].usd.numdonations} {''}
                    donations
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <article
            className="prose max-w-none pb-8 pt-8 dark:prose-dark xl:col-span-2"
            dangerouslySetInnerHTML={{ __html: xss(content || '') }}
          />
        </PageHeading>
      </div>

      {/* <div className="flex flex-col items-center">
        <div
          className={
            'h-[15rem] w-full relative bg-gradient-to-b from-white to-gray-200'
          }
        >
          <Image
            alt={title}
            src={coverImage}
            layout="fill"
            objectFit="contain"
            objectPosition="50% 50%"
          />
        </div>

        <div className="flex w-full p-4 py-8 md:px-8"></div>
        <article className="px-4 md:px-8 pb-8 lg:flex lg:flex-row-reverse lg:items-start">
          <div className={markdownStyles['markdown']}>
            
          </div>

          <aside className="p-4 bg-light rounded-xl flex lg:flex-col lg:items-start gap-4 min-w-[20rem] justify-between items-center mb-8">
            {isFunded ? `` : <button onClick={openPaymentModal}>Donate</button>}
            {stats && (
              <div>
                <h5>Raised</h5>
                <h4>{`${formatUsd(stats[slug].xmr.totaldonationsinfiat + stats[slug].btc.totaldonationsinfiat + stats[slug].usd.totaldonationsinfiat)}`}</h4>
                <h6>{stats[slug].xmr.totaldonations} XMR</h6>
                <h6>{stats[slug].btc.totaldonations} BTC</h6>
                <h6>{`${formatUsd(stats[slug].usd.totaldonations)}`} Fiat</h6>
              </div>
            )}

            {stats && (
              <div>
                <h5>Donations</h5>
                <h4>
                  {stats[slug].xmr.numdonations +
                    stats[slug].btc.numdonations +
                    stats[slug].usd.numdonations}
                </h4>
                <h6>{stats[slug].xmr.numdonations} in XMR</h6>
                <h6>{stats[slug].btc.numdonations} in BTC</h6>
                <h6>{stats[slug].usd.numdonations} in Fiat</h6>

                <Progress
                  text={Math.floor(
                    ((stats[slug].xmr.totaldonationsinfiat +
                      stats[slug].btc.totaldonationsinfiat +
                      stats[slug].usd.totaldonationsinfiat) /
                      goal) *
                      100
                  )}
                ></Progress>
              </div>
            }
          </aside>
        </article>

        <aside className="bg-light mb-8 flex min-w-[20rem] items-center justify-between gap-4 rounded-xl p-4 lg:flex-col lg:items-start">
          {!isFunded && (
            <button
              onClick={openPaymentModal}
              className="block rounded border border-stone-800 bg-stone-800 px-4 py-2 font-semibold text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500"
            >
              Donate
            </button>
          )}
        </aside>
      </div> */}

      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}

export default Project

export async function getServerSideProps({ params }: { params: any }) {
  const post = getPostBySlug(params.slug)

  const projects = getAllPosts()

  const content = await markdownToHtml(post.content || '')

  let stats: any = {}

  for (let i = 0; i < projects.length; i++) {
    let xmr
    let btc
    let usd

    if (projects[i].isFunded) {
      xmr = {
        numdonations: projects[i].numdonationsxmr,
        totaldonationsinfiat: projects[i].totaldonationsinfiatxmr,
        totaldonations: projects[i].totaldonationsxmr,
      }
      btc = {
        numdonations: projects[i].numdonationsbtc,
        totaldonationsinfiat: projects[i].totaldonationsinfiatbtc,
        totaldonations: projects[i].totaldonationsbtc,
      }
      usd = {
        numdonations: projects[i].fiatnumdonations,
        totaldonationsinfiat: projects[i].fiattotaldonationsinfiat,
        totaldonations: projects[i].fiattotaldonations,
      }
    } else {
      const crypto = await fetchGetJSONAuthedBTCPay(projects[i].slug)
      xmr = await crypto.xmr
      btc = await crypto.btc
      usd = await fetchGetJSONAuthedStripe(projects[i].slug)
    }

    stats[projects[i].slug] = { xmr, btc, usd }
  }

  return {
    props: {
      project: {
        ...post,
        content,
      },
      projects,
      stats,
    },
  }
}
