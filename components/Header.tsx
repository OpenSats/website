import Image from 'next/image'
import logo from '../public/logo.svg'
import Link from 'next/link'

const Header = () => {
  return (
    <header className="bg-white p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <div className="flex items-center w-[200px] py-4 pr-8">
          <Link href="/" passHref>
            <a>
              <Image alt="OpenSats logo" src={logo} className="cursor-pointer" />
            </a>
          </Link>
        </div>
        <nav>
          <ul className="flex flex-col sm:flex-row gap-4">
            <li>
              <Link href="/projects">
                <a>Projects</a>
              </Link>
            </li>
            <li>
              <Link href="/apply">
                <a>Apply</a>
              </Link>
            </li>
            <li>
              <Link href="/faq">
                <a>FAQ</a>
              </Link>
            </li>
            <li>
              <Link href="/blog">
                <a>Blog</a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a>About Us</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
