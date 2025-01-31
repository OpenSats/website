import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export type ProjectCardProps = {
  slug
  title
  summary
  coverImage
  nym
  tags
  customImageStyles?: React.CSSProperties
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  slug,
  title,
  summary,
  coverImage,
  nym,
  tags,
  customImageStyles,
}) => {
  const [isHorizontal, setIsHorizontal] = useState<boolean | null>(null)

  useEffect(() => {
    const img = document.createElement('img')
    img.src = coverImage

    // check if image is horizontal - added additional 10% to height to ensure only true
    // horizontals get flagged.
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img
      const isHorizontal = naturalWidth >= naturalHeight * 1.1
      setIsHorizontal(isHorizontal)
    }
  }, [coverImage])

  let cardStyle
  if (tags.includes('Nostr')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-purple-600 bg-stone-100 dark:border-purple-600 dark:bg-stone-900'
  } else if (tags.includes('Lightning')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-yellow-300 bg-stone-100 dark:border-yellow-300 dark:bg-stone-900'
  } else if (tags.includes('Bitcoin')) {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-orange-400 bg-stone-100 dark:border-orange-400 dark:bg-stone-900'
  } else {
    cardStyle =
      'h-full space-y-4 rounded-xl border-b-4 border-stone-100 bg-stone-100 dark:border-stone-800 dark:bg-stone-900'
  }

  return (
    <figure className={cardStyle}>
      <Link href={`${slug}`} passHref>
        <div className="flex h-36 w-full sm:h-52">
          <Image
            alt={title}
            src={coverImage}
            width={1200}
            height={1200}
            style={{
              objectFit: isHorizontal ? 'fill' : 'cover',
              ...customImageStyles,
            }}
            priority={true}
            className="cursor-pointer rounded-t-xl bg-white dark:bg-black"
          />
        </div>
        <figcaption className="p-2">
          <h2 className="font-bold">{title}</h2>
          <div className="mb-4 text-sm">by {nym}</div>
          <div className="mb-2 line-clamp-3">{summary}</div>
        </figcaption>
      </Link>
    </figure>
  )
}

export default ProjectCard
