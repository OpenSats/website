import { ReactNode } from 'react'
import type { Project } from 'contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer'
import ProjectLayout from './ProjectLayout'

// Funds reuse the project page chrome (cover image, social links, etc.)
// but need a different SEO surface: their OG image lives under
// /static/images/funds/og/<slug>.png and the title omits the
// "funded by OpenSats" suffix that doesn't read well for a fund.
interface Props {
  children: ReactNode
  content: CoreContent<Project>
}

export default function FundLayout({ children, content }: Props) {
  return (
    <ProjectLayout content={content} kind="fund">
      {children}
    </ProjectLayout>
  )
}
