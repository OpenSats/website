import CustomLink from './CustomLink'

// import SocialIcon from '@/components/social-icons'

function Footer() {
  return (
    <footer>
      <div className="mb-4 mt-16 flex flex-col items-center">
        <div className="space-x-4 text-center text-xs text-gray-500 dark:text-gray-400">
          MAGIC Grants is a 501(c)(3) non-profit organization. All gifts and
          donations are tax-deductible to the full extent of the law.
        </div>
        <div className="mb-2 flex space-x-2 text-xs text-gray-500 dark:text-gray-400"></div>
        <div className="space-x-4 text-center text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} MAGIC Grants. This website builds upon
          technology by Open Sats.
        </div>
      </div>
    </footer>
  )
}

export default Footer
