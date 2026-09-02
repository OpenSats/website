import { useCallback, useEffect, useRef, useState } from 'react'
import ShowcaseProjectEntry from '@/components/ShowcaseProjectEntry'
import type { ShowcaseProjectEntryProps } from '@/components/ShowcaseProjectEntry'

type ProjectCarouselProps = {
  projects: ShowcaseProjectEntryProps[]
}

const AUTO_ADVANCE_MS = 6000

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects }) => {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const indexRef = useRef(0)
  const [paused, setPaused] = useState(false)

  const scrollTo = useCallback(
    (nextIndex: number) => {
      const scroller = scrollerRef.current
      if (!scroller) return

      const wrapped =
        ((nextIndex % projects.length) + projects.length) % projects.length
      indexRef.current = wrapped
      scroller.scrollTo({
        left: wrapped * scroller.clientWidth,
        behavior: 'smooth',
      })
    },
    [projects.length]
  )

  useEffect(() => {
    if (paused || projects.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      scrollTo(indexRef.current + 1)
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(id)
  }, [paused, projects.length, scrollTo])

  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller || !scroller.clientWidth) return

    indexRef.current = Math.round(scroller.scrollLeft / scroller.clientWidth)
  }

  if (!projects.length) return null

  return (
    <div
      className="pt-4"
      role="region"
      aria-roledescription="carousel"
      aria-label="Explore projects"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false)
        }
      }}
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
    </div>
  )
}

export default ProjectCarousel
