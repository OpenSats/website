import fs from 'fs'
import path from 'path'
import { InferGetStaticPropsType } from 'next'
import { PageSEO } from '@/components/SEO'

export const getStaticProps = async () => {
  const svgPath = path.join(process.cwd(), 'public', 'maps', 'world.svg')
  let svg = fs.readFileSync(svgPath, 'utf8')

  // Strip XML declaration - it doesn't belong in HTML
  svg = svg.replace(/<\?xml[\s\S]*?\?>\s*/i, '').trim()

  return { props: { svg } }
}

export default function MapPage({
  svg,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title="Map - OpenSats"
        description="Countries where OpenSats has awarded grants."
      />

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-6 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
            Grant map
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Countries highlighted in orange have received OpenSats grants.
          </p>
        </div>

        <div className="pt-6">
          <div
            className="grant-map"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>

      <style jsx global>{`
        .grant-map svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .grant-map svg path {
          fill: rgb(229 231 235); /* gray-200 */
          stroke: rgb(255 255 255);
          stroke-width: 0.5;
          transition: fill 120ms ease;
        }

        .dark .grant-map svg path {
          fill: rgb(64 64 64); /* neutral-ish */
          stroke: rgb(23 23 23);
        }

        .grant-map svg path:hover {
          fill: rgb(253 186 116); /* orange-300 */
        }
      `}</style>
    </>
  )
}

