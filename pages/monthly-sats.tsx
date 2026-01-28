import fs from 'fs'
import path from 'path'
import { InferGetStaticPropsType } from 'next'
import { PageSEO } from '@/components/SEO'

export const getStaticProps = async () => {
  const svgPath = path.join(
    process.cwd(),
    'public',
    'static',
    'monthly-grant-payouts.svg'
  )

  // Return 404 if the SVG file doesn't exist
  if (!fs.existsSync(svgPath)) {
    return { notFound: true }
  }

  let svg = fs.readFileSync(svgPath, 'utf8')

  // Strip XML declaration - it doesn't belong in HTML
  svg = svg.replace(/<\?xml[\s\S]*?\?>\s*/i, '').trim()

  return { props: { svg } }
}

export default function MonthlySatsPage({
  svg,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO
        title="Monthly Grant Payouts - OpenSats"
        description="OpenSats monthly grant payout infographic."
      />

      <div className="flex flex-col items-center py-12">
        <div
          className="monthly-sats-svg w-full max-w-5xl"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <style jsx global>{`
        .monthly-sats-svg svg {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
    </>
  )
}
