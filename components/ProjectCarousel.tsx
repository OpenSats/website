import { useCallback, useEffect, useRef, useState } from 'react'
import ShowcaseProjectEntry from '@/components/ShowcaseProjectEntry'
import type { ShowcaseProjectEntryProps } from '@/components/ShowcaseProjectEntry'

type ProjectCarouselProps = {
  projects: ShowcaseProjectEntryProps[]
}

const AUTO_ADVANCE_MS = 6000

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects }) => {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const pausedRef = useRef(false)
  const resetElapsedRef = useRef(false)
  const [paused, setPaused] = useState(false)

  pausedRef.current = paused

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
    if (projects.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let elapsed = 0
    let last = performance.now()
    let frame = 0

    const setBar = (value: number) => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${value})`
      }
    }

    const loop = (now: number) => {
      const dt = now - last
      last = now

      if (resetElapsedRef.current) {
        elapsed = 0
        resetElapsedRef.current = false
        setBar(0)
      }

      if (!pausedRef.current) {
        elapsed += dt
        if (elapsed >= AUTO_ADVANCE_MS) {
          elapsed = 0
          scrollTo(indexRef.current + 1)
        }
        setBar(Math.min(elapsed / AUTO_ADVANCE_MS, 1))
      }

      frame = window.requestAnimationFrame(loop)
    }

    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [projects.length, scrollTo])

  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller || !scroller.clientWidth) return

    const next = Math.round(scroller.scrollLeft / scroller.clientWidth)
    if (next !== indexRef.current) {
      indexRef.current = next
      resetElapsedRef.current = true
    }
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
      <div
        aria-hidden
        className="mt-5 h-0.5 w-full overflow-hidden bg-gray-200 dark:bg-gray-800"
      >
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-primary-500"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}

export default ProjectCarousel
