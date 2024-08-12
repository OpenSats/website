import { useState } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next/types'
import ErrorPage from 'next/error'
import Image from 'next/image'
import xss from 'xss'

import { ProjectDonationStats, ProjectItem } from '../../utils/types'
import { getProjectBySlug, getAllPosts } from '../../utils/md'
import markdownToHtml from '../../utils/markdownToHtml'
import {
  fetchPostJSON,
  fetchGetJSONAuthedBTCPay,
  fetchGetJSONAuthedStripe,
} from '../../utils/api-helpers'
import PageHeading from '../../components/PageHeading'
import SocialIcon from '../../components/social-icons'
import Progress from '../../components/Progress'
import { prisma } from '../../server/services'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent } from '../../components/ui/dialog'
import DonationFormModal from '../../components/DonationFormModal'
import MembershipFormModal from '../../components/MembershipFormModal'
import Head from 'next/head'

type SingleProjectPageProps = {
  project: ProjectItem
  projects: ProjectItem[]
  donationStats: ProjectDonationStats
}

const Project: NextPage<SingleProjectPageProps> = ({ project, projects, donationStats }) => {
  const router = useRouter()

  const [donateModalOpen, setDonateModalOpen] = useState(false)
  const [memberModalOpen, setMemberModalOpen] = useState(false)

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
      <Head>
        <title>Monero Fund - {project.title}</title>
      </Head>

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
              {!project.isFunded && (
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => setDonateModalOpen(true)}>Donate</Button>
                  <Button onClick={() => setMemberModalOpen(true)} variant="outline">
                    Get Annual Membership
                  </Button>
                </div>
              )}

              <h1 className="mb-4 font-bold">Raised</h1>

              <Progress
                percent={Math.floor(
                  ((donationStats.xmr.fiatAmount +
                    donationStats.btc.fiatAmount +
                    donationStats.usd.fiatAmount) /
                    goal) *
                    100
                )}
              />

              <ul className="font-semibold space-y-1">
                <li className="flex items-center space-x-1">
                  <span className="text-green-500 text-xl">{`${formatUsd(donationStats.xmr.fiatAmount + donationStats.btc.fiatAmount + donationStats.usd.fiatAmount)}`}</span>{' '}
                  <span className="font-normal text-sm text-gray">
                    in {donationStats.xmr.count + donationStats.btc.count + donationStats.usd.count}{' '}
                    donations total
                  </span>
                </li>
                <li>
                  {donationStats.xmr.amount} XMR{' '}
                  <span className="font-normal text-sm text-gray">
                    in {donationStats.xmr.count} donations
                  </span>
                </li>
                <li>
                  {donationStats.btc.amount} BTC{' '}
                  <span className="font-normal text-sm text-gray">
                    in {donationStats.btc.count} donations
                  </span>
                </li>
                <li>
                  {`${formatUsd(donationStats.usd.amount)}`} Fiat{' '}
                  <span className="font-normal text-sm text-gray">
                    in {donationStats.usd.count} donations
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

      <Dialog open={donateModalOpen} onOpenChange={setDonateModalOpen}>
        <DialogContent>
          <DonationFormModal project={project} />
        </DialogContent>
      </Dialog>

      <Dialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <DialogContent>
          <MembershipFormModal project={project} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Project

export async function getServerSideProps({ params }: { params: any }) {
  const project = getProjectBySlug(params.slug)
  const content = await markdownToHtml(project.content || '')

  const donationStats = {
    xmr: {
      count: project.isFunded ? project.numdonationsxmr : 0,
      amount: project.isFunded ? project.totaldonationsxmr : 0,
      fiatAmount: project.isFunded ? project.totaldonationsinfiatxmr : 0,
    },
    btc: {
      count: project.isFunded ? project.numdonationsbtc : 0,
      amount: project.isFunded ? project.totaldonationsbtc : 0,
      fiatAmount: project.isFunded ? project.totaldonationsinfiatbtc : 0,
    },
    usd: {
      count: project.isFunded ? project.fiatnumdonations : 0,
      amount: project.isFunded ? project.fiattotaldonations : 0,
      fiatAmount: project.isFunded ? project.fiattotaldonationsinfiat : 0,
    },
  }

  if (!project.isFunded) {
    const donations = await prisma.donation.findMany({ where: { projectSlug: params.slug } })

    donations.forEach((donation) => {
      if (donation.cryptoCode === 'XMR') {
        donationStats.xmr.count += 1
        donationStats.xmr.amount += donation.cryptoAmount
        donationStats.xmr.fiatAmount += donation.fiatAmount
      }

      if (donation.cryptoCode === 'BTC') {
        donationStats.btc.count += 1
        donationStats.btc.amount += donation.cryptoAmount
        donationStats.btc.fiatAmount += donation.fiatAmount
      }

      if (donation.cryptoCode === null) {
        donationStats.usd.count += 1
        donationStats.usd.amount += donation.fiatAmount
        donationStats.usd.fiatAmount += donation.fiatAmount
        console.log(donation)
      }
    })
  }

  return {
    props: {
      project: {
        ...project,
        content,
      },
      donationStats,
    },
  }
}
