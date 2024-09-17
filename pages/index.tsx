import Link from 'next/link'

import { funds } from '../utils/funds'
import { Button } from '../components/ui/button'
import FiroLogo from '../components/FiroLogo'
import PrivacyGuidesLogo from '../components/PrivacyGuidesLogo'
import MagicLogo from '../components/MagicLogo'
import MoneroLogo from '../components/MoneroLogo'
import ProjectList from '../components/ProjectList'
import { getProjects } from '../utils/md'
import { cn } from '../utils/cn'
import { ProjectItem } from '../utils/types'
import { networkFor, SocialIcon } from 'react-social-icons'
import WebIcon from '../components/WebIcon'
import CustomLink from '../components/CustomLink'

function Home({ projects }: { projects: ProjectItem[] }) {
  return (
    <div className="flex flex-col items-start space-y-10">
      <div className="w-full space-y-4">
        <h1 className="py-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          Funds
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(funds).map((fund, fundIndex) => (
            <div
              key={fund.slug}
              className="w-full min-h-72 p-6 space-y-4 flex flex-col justify-between rounded-lg bg-white"
            >
              <div className="w-full space-y-4">
                <div className="flex items-center space-x-3">
                  {fund.slug === 'monero' && <MoneroLogo className="h-10 w-10" />}
                  {fund.slug === 'firo' && <FiroLogo className="w-10 h-10" />}
                  {fund.slug === 'privacyguides' && <PrivacyGuidesLogo className="w-10 h-10" />}
                  {fund.slug === 'general' && <MagicLogo className="w-10 h-10" />}

                  <h1 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    {fund.title}
                  </h1>
                </div>

                <span className="w-full text-muted-foreground block">{fund.summary}</span>

                <div className="flex flex-row">
                  {fund.socialLinks.map((link) =>
                    networkFor(link) !== 'sharethis' ? (
                      <SocialIcon
                        key={`social-icon-${link}`}
                        url={link}
                        className={cn(
                          'text-gray-700 transition-colors',
                          fund.slug === 'monero' && 'hover:text-monero',
                          fund.slug === 'firo' && 'hover:text-firo',
                          fund.slug === 'privacyguides' && 'hover:text-privacyguides',
                          fund.slug === 'general' && 'hover:text-general'
                        )}
                        style={{ width: 40, height: 40 }}
                        fgColor="currentColor"
                        bgColor="transparent"
                      />
                    ) : (
                      <CustomLink
                        key={`social-icon-${link}`}
                        href={link}
                        className={cn(
                          'text-gray-700',
                          fund.slug === 'monero' && 'hover:text-monero',
                          fund.slug === 'firo' && 'hover:text-firo',
                          fund.slug === 'privacyguides' && 'hover:text-privacyguides',
                          fund.slug === 'general' && 'hover:text-general'
                        )}
                      >
                        <WebIcon style={{ width: 40, height: 40, padding: 8 }} />
                      </CustomLink>
                    )
                  )}
                </div>
              </div>

              <Link href={`/${fund.slug}`} target="_blank" className="hidden self-end sm:block">
                <Button
                  className={cn(
                    fund.slug === 'monero' && 'text-monero bg-monero/10 hover:bg-monero',
                    fund.slug === 'firo' && 'text-firo bg-firo/10 hover:bg-firo',
                    fund.slug === 'privacyguides' &&
                      'text-privacyguides bg-privacyguides/10 hover:bg-privacyguides',
                    fund.slug === 'general' && 'text-general bg-general/10 hover:bg-general'
                  )}
                  size="lg"
                  variant="light"
                >
                  View Campaigns
                </Button>
              </Link>

              <Link href={`/${fund.slug}`} target="_blank" className="self-end sm:hidden">
                <Button
                  className={cn(
                    fund.slug === 'monero' && 'text-monero bg-monero/10 hover:bg-monero',
                    fund.slug === 'firo' && 'text-firo bg-firo/10 hover:bg-firo',
                    fund.slug === 'privacyguides' &&
                      'text-privacyguides bg-privacyguides/10 hover:bg-privacyguides',
                    fund.slug === 'general' && 'text-general bg-general/10 hover:bg-general'
                  )}
                  variant="light"
                >
                  View Campaigns
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <h1 className="py-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
        Campaigns
      </h1>

      <ProjectList projects={projects} />
    </div>
  )
}

export default Home

export async function getStaticProps({ params }: { params: any }) {
  const projects = await getProjects()

  return {
    props: {
      projects,
    },
    revalidate: 120,
  }
}
