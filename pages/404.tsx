import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'

export default function FourZeroFour() {
  return (
    <>
      <PageSEO title="Page Not Found" description="Sorry we couldn't find this page :(" />
      <div className="flex flex-col items-start justify-start md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-6xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 md:border-r-2 md:px-6 md:text-8xl md:leading-14">
            404
          </h1>
        </div>
        <div className="max-w-md">
          <p className="mb-4 text-xl font-bold leading-normal md:text-2xl">
            Sorry we couldn't find this page.
          </p>
          <p className="mb-8">
            But dont worry, you can find plenty of other things on our homepage.
          </p>
          <Link
            href="/"
            className="focus:shadow-outline-orange inline rounded-lg border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium leading-5 text-white shadow transition-colors duration-150 hover:bg-orange-700 focus:outline-none dark:hover:bg-orange-500"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </>
  )
}
