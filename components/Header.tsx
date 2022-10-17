import Image from 'next/image'
import logo from '../public/magic_logo.png'
import Link from 'next/link'

const Header = () => {
  return (
    <header className="bg-white p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <div className="flex items-center w-[200px] py-4 pr-8">
          <Link href="https://magicgrants.org" passHref>
            <a>
              <Image alt="MAGIC logo" src={logo} className="cursor-pointer" />
            </a>
          </Link>
        </div>
        <nav>
          <ul className="flex flex-col sm:flex-row gap-4">
            <li>
              <Link href="https://magicgrants.org/about/">
                <a>About MAGIC</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
