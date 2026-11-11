/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- Native scroll regions need focus for keyboard scrolling. */
import Image from '@/components/Image'

type Photo = {
  src: string
  alt: string
  width: number
  height: number
}

export default function PhotoStrip({
  title,
  images,
}: {
  title: string
  images: Photo[]
}) {
  const portrait = images.every((photo) => photo.height > photo.width)

  return (
    <section className="not-prose my-10 min-w-0 max-w-full" aria-label={title}>
      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain rounded-sm pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 sm:gap-4"
        tabIndex={0}
        role="region"
        aria-label={`${title}: scroll or use arrow keys; select a photo to view it larger`}
      >
        {images.map((photo) => (
          <figure
            key={photo.src}
            className={`m-0 shrink-0 snap-center ${
              portrait ? 'w-[88%] sm:w-[45%]' : 'w-[80%] sm:w-[70%]'
            }`}
          >
            <a
              href={photo.src}
              className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              aria-label={`View larger: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                sizes={
                  portrait
                    ? '(max-width: 640px) 88vw, 350px'
                    : '(max-width: 640px) 80vw, 540px'
                }
                className="h-auto w-full rounded-lg"
              />
            </a>
            <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {photo.alt}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
