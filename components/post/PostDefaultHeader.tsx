import PageTitle from '@/components/PageTitle'
import siteMetadata from '@/data/siteMetadata'
import { postDateTemplate } from '@/components/post/postShared'

interface Props {
  date: string
  title: string
}

export default function PostDefaultHeader({ date, title }: Props) {
  return (
    <header className="pt-6 xl:pb-6">
      <div className="space-y-1 text-center">
        <dl className="space-y-10">
          <div>
            <dt className="sr-only">Published on</dt>
            <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
              <time dateTime={date}>
                {new Date(date).toLocaleDateString(
                  siteMetadata.locale,
                  postDateTemplate
                )}
              </time>
            </dd>
          </div>
        </dl>
        <div>
          <PageTitle>{title}</PageTitle>
        </div>
      </div>
    </header>
  )
}
