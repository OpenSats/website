import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext, NextPage } from 'next/types'
import Head from 'next/head'
import ErrorPage from 'next/error'
import Link from 'next/link'
import Image from 'next/image'
import xss from 'xss'

import { ProjectDonationStats, ProjectItem } from '../../../utils/types'
import { getProjectBySlug } from '../../../utils/md'
import markdownToHtml from '../../../utils/markdownToHtml'
import PageHeading from '../../../components/PageHeading'
import Progress from '../../../components/Progress'
import { prisma } from '../../../server/services'
import { Button } from '../../../components/ui/button'
import CustomLink from '../../../components/CustomLink'
import { trpc } from '../../../utils/trpc'
import { getFundSlugFromUrlPath } from '../../../utils/funds'
import { useFundSlug } from '../../../utils/use-fund-slug'
import { Table, TableBody, TableCell, TableRow } from '../../../components/ui/table'
import { cn } from '../../../utils/cn'

type SingleProjectPageProps = {
  project: ProjectItem
  projects: ProjectItem[]
  donationStats: ProjectDonationStats
}

const Project: NextPage<SingleProjectPageProps> = ({ project, donationStats }) => {
  const router = useRouter()
  const [registerIsOpen, setRegisterIsOpen] = useState(false)
  const [loginIsOpen, setLoginIsOpen] = useState(false)
  const [passwordResetIsOpen, setPasswordResetIsOpen] = useState(false)
  const session = useSession()
  const fundSlug = useFundSlug()

  const userHasMembershipQuery = trpc.donation.userHasMembership.useQuery(
    { projectSlug: project.slug },
    { enabled: false }
  )

  const { slug, title, summary, coverImage, content, nym, website, goal, isFunded } = project

  function formatBtc(bitcoin: number) {
    if (bitcoin > 0.1) {
      return `${bitcoin.toFixed(3) || 0.0} BTC`
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

  useEffect(() => {
    if (session.status === 'authenticated') {
      userHasMembershipQuery.refetch()
    }
  }, [session.status])

  if (!router.isFallback && !slug) {
    return <ErrorPage statusCode={404} />
  }

  const leaderboardQuery = trpc.leaderboard.getLeaderboard.useQuery({
    fundSlug: fundSlug || 'general',
    projectSlug: project.slug,
  })

  return (
    <>
      <Head>
        <title>Monero Fund | {project.title}</title>
      </Head>

      <div className="divide-y divide-gray-200">
        <PageHeading project={project}>
          <div className="w-full flex flex-col items-center gap-4 xl:flex">
            <Image
              src={coverImage}
              alt="avatar"
              width={700}
              height={700}
              className="w-full max-w-[700px] mx-auto object-contain xl:hidden"
            />

            <div className="w-full max-w-96 space-y-8 p-6 bg-white rounded-lg">
              {!project.isFunded && (
                <div className="w-full">
                  <div className="flex flex-col space-y-2">
                    <Link href={`/${fundSlug}/donate/${project.slug}`}>
                      <Button className="w-full">Donate</Button>
                    </Link>
                    {!userHasMembershipQuery.data && (
                      <>
                        {session.status !== 'authenticated' ? (
                          <Button onClick={() => setRegisterIsOpen(true)} variant="outline">
                            Get Annual Membership
                          </Button>
                        ) : (
                          <Link href={`/${fundSlug}/membership/${project.slug}`}>
                            <Button variant="outline" className="w-full">
                              Get Annual Membership
                            </Button>
                          </Link>
                        )}
                      </>
                    )}

                    {!!userHasMembershipQuery.data && (
                      <Button variant="outline">
                        <CustomLink href={`${fundSlug}/account/my-memberships`}>
                          My Memberships
                        </CustomLink>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="w-full">
                <h1 className="mb-4 font-bold">Raised</h1>

                <Progress
                  current={
                    donationStats.xmr.fiatAmount +
                    donationStats.btc.fiatAmount +
                    donationStats.usd.fiatAmount
                  }
                  goal={goal}
                />

                <ul className="font-semibold space-y-1">
                  <li className="flex items-center space-x-1">
                    <span className="text-green-500 text-xl">{`${formatUsd(donationStats.xmr.fiatAmount + donationStats.btc.fiatAmount + donationStats.usd.fiatAmount)}`}</span>{' '}
                    <span className="font-normal text-sm text-gray">
                      in{' '}
                      {donationStats.xmr.count + donationStats.btc.count + donationStats.usd.count}{' '}
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
                    {formatBtc(donationStats.btc.amount)}{' '}
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

            <div className="w-full max-w-96 min-h-72 space-y-4 p-6 bg-white rounded-lg">
              <h1 className="font-bold">Leaderboard</h1>

              {leaderboardQuery.data?.length ? (
                <Table>
                  <TableBody>
                    {leaderboardQuery.data.map((leaderboardItem, index) => (
                      <TableRow
                        key={`leaderboard-item-${leaderboardItem.name}-${leaderboardItem.amount}`}
                      >
                        <TableCell>
                          <div
                            className={cn(
                              'w-8 h-8 flex font-bold text-primary rounded-full',
                              1 ? 'bg-primary/15' : ''
                            )}
                          >
                            <span className="m-auto">{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-full font-medium">{leaderboardItem.name}</TableCell>
                        <TableCell className="font-bold text-green-500">
                          {formatUsd(leaderboardItem.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <span className="text-muted-foreground">No donations</span>
              )}
            </div>
          </div>

          <article
            className="prose max-w-none mt-4 p-6 xl:col-span-2 bg-white rounded-lg"
            dangerouslySetInnerHTML={{ __html: xss(content || '') }}
          />
        </PageHeading>
      </div>
    </>
  )
}

export default Project

export async function getServerSideProps({ params, resolvedUrl }: GetServerSidePropsContext) {
  const fundSlug = getFundSlugFromUrlPath(resolvedUrl)

  if (!params?.slug) return {}
  if (!fundSlug) return {}

  const project = getProjectBySlug(params.slug as string, fundSlug)
  const content = await markdownToHtml(project.content || '')

  const donationStats = {
    xmr: {
      count: project.isFunded ? project.numDonationsXMR : 0,
      amount: project.isFunded ? project.totalDonationsXMR : 0,
      fiatAmount: project.isFunded ? project.totalDonationsXMRInFiat : 0,
    },
    btc: {
      count: project.isFunded ? project.numDonationsBTC : 0,
      amount: project.isFunded ? project.totalDonationsBTC : 0,
      fiatAmount: project.isFunded ? project.totalDonationsBTCInFiat : 0,
    },
    usd: {
      count: project.isFunded ? project.numDonationsFiat : 0,
      amount: project.isFunded ? project.totalDonationsFiat : 0,
      fiatAmount: project.isFunded ? project.totalDonationsFiat : 0,
    },
  }

  if (!project.isFunded) {
    const donations = await prisma.donation.findMany({
      where: { projectSlug: params.slug as string, fundSlug },
    })

    donations.forEach((donation) => {
      if (donation.cryptoCode === 'XMR') {
        donationStats.xmr.count += 1
        donationStats.xmr.amount += donation.netCryptoAmount || 0
        donationStats.xmr.fiatAmount += donation.netFiatAmount
      }

      if (donation.cryptoCode === 'BTC') {
        donationStats.btc.count += 1
        donationStats.btc.amount += donation.netCryptoAmount || 0
        donationStats.btc.fiatAmount += donation.netFiatAmount
      }

      if (donation.cryptoCode === null) {
        donationStats.usd.count += 1
        donationStats.usd.amount += donation.netFiatAmount
        donationStats.usd.fiatAmount += donation.netFiatAmount
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
