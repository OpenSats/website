import { allAuthors } from 'contentlayer/generated'
import Link from '@/components/Link'
import Image from '@/components/Image'

export default function DesignTeam() {
  const boardMembers = allAuthors
    .filter((p) => p.board === true)
    .sort(() => Math.random() - 0.5)
  return (
    <>
      {/* List all members of the design team */}
      <div className="col-span-2 col-start-2 grid grid-cols-2 space-y-2 sm:gap-x-2 md:grid-cols-3 md:gap-x-8">
        {boardMembers.map((member, i) => (
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
    </>
  )
}
