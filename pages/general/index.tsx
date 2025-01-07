import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { getProjects } from '../../utils/md'
import CustomLink from '../../components/CustomLink'
import { Button } from '../../components/ui/button'
import ProjectList from '../../components/ProjectList'
import { trpc } from '../../utils/trpc'
import { funds } from '../../utils/funds'

const fund = funds['general']

const Home: NextPage<{ projects: any }> = ({ projects }) => {
  const session = useSession()

  const userHasMembershipQuery = trpc.donation.userHasMembership.useQuery(
    { projectSlug: fund.slug },
    { enabled: false }
  )

  useEffect(() => {
    if (session.status === 'authenticated') {
      userHasMembershipQuery.refetch()
    }
  }, [session.status])

  return (
    <>
      <Head>
        <title>{fund.title}</title>
        <meta name="description" content="TKTK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="divide-y divide-gray-200">
        <div className="pt-4 md:pb-8">
          <h1 className="py-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Support MAGIC Grants
          </h1>
          <p className="max-w-3xl text-xl leading-7 text-gray-500">
            MAGIC Grants is a public charity that provides undergraduate scholarships for students
            interested in cryptocurrencies and privacy, supports public cryptocurrency
            infrastructure, and supports privacy.
          </p>

          <div className="flex flex-col md:flex-row my-4 gap-2">
            <Link href={`/${fund.slug}/donate/${fund.slug}`}>
              <Button className="text-sm md:text-base" size="lg">
                Donate to MAGIC Grants
              </Button>
            </Link>

            {!userHasMembershipQuery.data && (
              <>
                {session.status === 'authenticated' ? (
                  <Link href={`/${fund.slug}/membership`}>
                    <Button variant="light" size="lg">
                      Get Annual Membership
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/${fund.slug}/register?nextAction=membership`}>
                    <Button variant="light" size="lg">
                      Get Annual Membership
                    </Button>
                  </Link>
                )}
              </>
            )}

            {!!userHasMembershipQuery.data && (
              <CustomLink href={`/${fund.slug}/account/my-memberships`}>
                <Button variant="light" size="lg">
                  My Memberships
                </Button>{' '}
              </CustomLink>
            )}
          </div>

          <p className="text-sm leading-7 text-gray-400">
            We are a 501(c)(3) public charity. Your donation may qualify for a tax deduction.
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        <div className="xl:pt-18 space-y-2 pt-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Explore Projects
          </h1>
          <p className="pt-2 text-lg leading-7 text-gray-500">
            Browse through a showcase of projects supported by us.
          </p>
          <ProjectList projects={projects} />
          <div className="flex justify-end pt-4 text-base font-medium leading-6">
            <CustomLink href={`/${fund.slug}/projects`} aria-label="View All Projects">
              View Projects &rarr;
            </CustomLink>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home

export async function getStaticProps({ params }: { params: any }) {
  const projects = await getProjects(fund.slug)

  return {
    props: {
      projects,
    },
    revalidate: 120,
  }
}
