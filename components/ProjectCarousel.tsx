import { useCallback, useRef, useState } from 'react'
import ShowcaseProjectEntry from '@/components/ShowcaseProjectEntry'
import type { ShowcaseProjectEntryProps } from '@/components/ShowcaseProjectEntry'

type ProjectCarouselProps = {
  projects: ShowcaseProjectEntryProps[]
}

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects }) => {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)

  const scrollTo = useCallback(
    (nextIndex: number) => {
      const scroller = scrollerRef.current
      if (!scroller) return

      const clamped = Math.max(0, Math.min(nextIndex, projects.length - 1))
      setIndex(clamped)
      scroller.scrollTo({
        left: clamped * scroller.clientWidth,
        behavior: 'smooth',
      })
    },
    [projects.length]
  )

  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller || !scroller.clientWidth) return

    setIndex(Math.round(scroller.scrollLeft / scroller.clientWidth))
  }

  if (!projects.length) return null

  return (
    <div
      className="pt-4"
      role="region"
      aria-roledescription="carousel"
      aria-label="Explore projects"
    >
      <ul
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project) => (
          <ShowcaseProjectEntry
            key={project.slug}
            {...project}
            variant="slide"
          />
        ))}
      </ul>

      <div className="flex items-center justify-between pt-5">
        <button
          type="button"
          aria-label="Previous project"
          disabled={index === 0}
          onClick={() => scrollTo(index - 1)}
          className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
        >
          &larr;
        </button>

        <div className="flex flex-wrap justify-center gap-1.5 px-3">
          {projects.map((project, i) => (
            <button
              key={project.slug}
              type="button"
              aria-label={`Go to ${project.title}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => scrollTo(i)}
              className={`h-2 w-2 rounded-full ${
                i === index
                  ? 'bg-primary-500'
                  : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next project"
          disabled={index === projects.length - 1}
          onClick={() => scrollTo(index + 1)}
          className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
        >
          &rarr;
        </button>
      </div>
    </div>
  )
}

export default ProjectCarousel
