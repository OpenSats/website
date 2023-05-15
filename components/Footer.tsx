import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-3 flex space-x-4">
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
          <SocialIcon kind="github" href={siteMetadata.github} size={6} />
          <SocialIcon kind="facebook" href={siteMetadata.facebook} size={6} />
          <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
          <SocialIcon kind="twitter" href={siteMetadata.twitter} size={6} />
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{siteMetadata.author}</div>
        </div>
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <center>
          <Link href="https://opensats.org/terms">
          Open Sats Initiative, Inc. (EIN 85-2722249) is a 501(c)(3) non-profit organization.<br/>
          All gifts and donations are tax-deductible to the full extent of the law.
          </Link>
          </center>
        </div>
      </div>
    </footer>
  )
}
