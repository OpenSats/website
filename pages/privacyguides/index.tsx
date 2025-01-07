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

const fund = funds['privacyguides']

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
            Support Privacy Guides
          </h1>
          <p className="max-w-3xl text-xl leading-7 text-gray-500">
            Privacy Guides is a not-for-profit, volunteer-run project that hosts online communities
            and publishes news and recommendations surrounding privacy and security tools, services,
            and knowledge.
          </p>

          <div className="flex flex-col md:flex-row my-4 gap-2">
            <Link href={`/${fund.slug}/donate/${fund.slug}`}>
              <Button className="text-sm md:text-base" size="lg">
                Donate to Privacy Guides
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

          <div className="flex flex-row flex-wrap">
            <p className="text-md leading-7 text-gray-500">
              Donate to
              <CustomLink href={`https://www.privacyguides.org/en/`}>
                {' '}
                Privacy Guides
              </CustomLink>{' '}
              and support our mission to defend digital rights and spread the word about mass
              surveillance programs and other daily privacy invasions. You can help Privacy Guides
              researchers, activists, and maintainers create informative content, host private
              digital services, and protect privacy rights at a time when the world needs it most.
            </p>
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
