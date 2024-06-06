import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'
import Nostr from './nostr.svg'
import Web from './globe-solid.svg'

// Icons taken from: https://simpleicons.org/ and https://fontawesome.com (globe)

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  nostr: Nostr,
  website: Web,
}

type Props = {
  kind: keyof typeof components
  href: string
  size?: number
}

const SocialIcon = ({ kind, href, size = 5 }: Props) => {
  if (
    !href ||
    (kind === 'mail' &&
      !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href))
  )
    return <></>

  const SocialSvg = components[kind]

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`fill-current text-gray-700 hover:text-orange-500 dark:text-gray-200 dark:hover:text-orange-500 h-${size} w-${size}`}
      />
    </a>
  )
}

export default SocialIcon
