import CustomLink from './CustomLink'

// import SocialIcon from '@/components/social-icons'

function Footer() {
  return (
    <footer className="pb-4 mt-16 flex flex-col items-center space-y-2">
      <div className="flex flex-row space-x-2 justify-center">
        <CustomLink href="/terms" className="text-xs hover:underline">
          Terms of Use
        </CustomLink>

        <span className="text-xs text-muted-foreground">|</span>

        <CustomLink href="/privacy" className="text-xs hover:underline">
          Privacy Policy
        </CustomLink>
      </div>

      <div className="space-x-4 text-center text-xs text-gray-500">
        MAGIC Grants is a 501(c)(3) public charity. Your donation may qualify for a tax
        deduction. Cryptocurrency donations over $500 require additional paperwork to claim a
        deduction.
      </div>

      <div className="space-x-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} MAGIC Grants. This website builds upon technology by Open
        Sats.
      </div>
    </footer>
  )
}

export default Footer
