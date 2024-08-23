import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

import { getProjects } from '../../utils/md'
import { ProjectItem } from '../../utils/types'
import Typing from '../../components/Typing'
import CustomLink from '../../components/CustomLink'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '../../components/ui/dialog'
import DonationFormModal from '../../components/DonationFormModal'
import MembershipFormModal from '../../components/MembershipFormModal'
import ProjectList from '../../components/ProjectList'
import LoginFormModal from '../../components/LoginFormModal'
import RegisterFormModal from '../../components/RegisterFormModal'
import PasswordResetFormModal from '../../components/PasswordResetFormModal'
import { trpc } from '../../utils/trpc'
import { funds } from '../../utils/funds'

const fund = funds['general']

const Home: NextPage<{ projects: any }> = ({ projects }) => {
  const [donateModalOpen, setDonateModalOpen] = useState(false)
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [registerIsOpen, setRegisterIsOpen] = useState(false)
  const [loginIsOpen, setLoginIsOpen] = useState(false)
  const [passwordResetIsOpen, setPasswordResetIsOpen] = useState(false)
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
            Support <Typing />
          </h1>
          <p className="max-w-3xl text-xl leading-7 text-gray-500">
            Help us to provide sustainable funding for free and open-source contributors working on
            freedom tech and projects that help Monero flourish.
          </p>

          <div className="flex flex-col md:flex-row my-4 gap-2">
            <Button
              className="text-sm md:text-base"
              onClick={() => setDonateModalOpen(true)}
              size="lg"
            >
              Donate to Monero Comittee General Fund
            </Button>

            {!userHasMembershipQuery.data && (
              <Button
                onClick={() =>
                  session.status === 'authenticated'
                    ? setMemberModalOpen(true)
                    : setRegisterIsOpen(true)
                }
                variant="light"
                size="lg"
              >
                Get Annual Membership
              </Button>
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
              Want to receive funding for your work?
              <CustomLink href={`/${fund.slug}/apply`}>
                {' '}
                Apply for a Monero development or research grant!
              </CustomLink>
            </p>
          </div>

          <p className="text-sm leading-7 text-gray-400">
            We are a 501(c)(3) public charity. All donations are tax deductible.
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

      <Dialog open={donateModalOpen} onOpenChange={setDonateModalOpen}>
        <DialogContent>
          <DonationFormModal project={fund} />
        </DialogContent>
      </Dialog>

      <Dialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <DialogContent>
          <MembershipFormModal project={fund} />
        </DialogContent>
      </Dialog>

      {session.status !== 'authenticated' && (
        <>
          <Dialog open={loginIsOpen} onOpenChange={setLoginIsOpen}>
            <DialogContent>
              <LoginFormModal
                close={() => setLoginIsOpen(false)}
                openRegisterModal={() => setRegisterIsOpen(true)}
                openPasswordResetModal={() => setPasswordResetIsOpen(true)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={registerIsOpen} onOpenChange={setRegisterIsOpen}>
            <DialogContent>
              <RegisterFormModal
                openLoginModal={() => setLoginIsOpen(true)}
                close={() => setRegisterIsOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={passwordResetIsOpen} onOpenChange={setPasswordResetIsOpen}>
            <DialogContent>
              <PasswordResetFormModal close={() => setPasswordResetIsOpen(false)} />
            </DialogContent>
          </Dialog>
        </>
      )}
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
