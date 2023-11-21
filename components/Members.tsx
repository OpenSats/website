import { allAuthors } from 'contentlayer/generated'
import Link from '@/components/Link'
import Image from '@/components/Image'

export default function Members({ subset }) {
  let members = allAuthors //.sort(() => Math.random() - 0.5)
  switch (subset) {
    case 'Board':
      members = allAuthors.filter((p) => p.board === true)
      break
    case 'Ops':
      members = allAuthors.filter((p) => p.ops === true)
      break
    case 'Volunteers':
      members = allAuthors.filter((p) => p.volunteer === true)
      break
  }

  return (
    <div className="col-span-2 col-start-2 grid grid-cols-2 space-y-2 sm:gap-x-2 md:grid-cols-3 md:gap-x-8">
      {members.map((member, i) => (
        <div className="items-left flex flex-col space-x-2 pt-8" key={i}>
          <Link href={`/about/${member.slug}`}>
            <Image
              src={member.avatar}
              alt={member.name}
              width={120}
              height={120}
              className="h-36 w-36 rounded-full"
            />
          </Link>
        </div>
      ))}
    </div>
  )
}
