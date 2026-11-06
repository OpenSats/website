/* eslint-disable react/display-name */
import React from 'react'
import dynamic from 'next/dynamic'
import type { MDXComponents as ComponentMap } from 'mdx/types'
import type { ReactNode } from 'react'
import { coreContent } from 'pliny/utils/contentlayer'
import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'

import Image from './Image'
import BrowserFrame from './BrowserFrame'
import PhoneFrame from './PhoneFrame'
import VideoPlayer from './VideoPlayer'
import CustomLink from './Link'
import DonateToGeneralFundForm from './DonateToGeneralFundForm'
import DonateToGeneralFundButton from './DonateToGeneralFundButton'
import DonateToNostrFundButton from './DonateToNostrFundButton'
import DonateToOperationsButton from './DonateToOperationsButton'
import DonateToRedFundButton from './DonateToRedFundButton'
import DonateRecurringButton from './DonateRecurringButton'
import DonateRecurringButtonV2 from './DonateRecurringButtonV2'
import ApplyButton from './ApplyButton'
import DesignTeam from './DesignTeam'
import Credits from './Supporters'
import YouTubeEmbed from './YouTubeEmbed'
import Members from './Members'
import LifetimeStats from './LifetimeStats'
import GranteeMap from './GranteeMap'
import StatsSentence from './StatsSentence'
import NewsletterSignup from './NewsletterSignup'
import ViewHeartbeatButton from './ViewHeartbeatButton'
import MediaKit, { MediaKitColors, MediaKitDownloadLink } from './MediaKit'

const layouts = {
  AuthorLayout: dynamic(() => import('@/layouts/AuthorLayout')),
  FundLayout: dynamic(() => import('@/layouts/FundLayout')),
  NewsletterLayout: dynamic(() => import('@/layouts/NewsletterLayout')),
  PageLayout: dynamic(() => import('@/layouts/PageLayout')),
  PostLayout: dynamic(() => import('@/layouts/PostLayout')),
  PostSimple: dynamic(() => import('@/layouts/PostSimple')),
  ProjectLayout: dynamic(() => import('@/layouts/ProjectLayout')),
  SpotlightLayout: dynamic(() => import('@/layouts/SpotlightLayout')),
  TopicLayout: dynamic(() => import('@/layouts/TopicLayout')),
}

type MDXLayout = {
  layout: string
  content: Parameters<typeof coreContent>[0]
  children?: ReactNode
}

export const Wrapper = ({ layout, content, ...rest }: MDXLayout) => {
  const Layout = layouts[layout]
  if (!Layout) throw new Error(`Unknown MDX layout: ${layout}`)
  return <Layout content={coreContent(content)} {...rest} />
}

export const MDXComponents: ComponentMap = {
  Image,
  BrowserFrame,
  PhoneFrame,
  VideoPlayer,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  wrapper: Wrapper,
  BlogNewsletterForm,
  DonateToGeneralFundForm,
  DonateToGeneralFundButton,
  DonateToNostrFundButton,
  DonateToOperationsButton,
  DonateToRedFundButton,
  DonateRecurringButton,
  DonateRecurringButtonV2,
  ApplyButton,
  DesignTeam,
  YouTubeEmbed,
  Credits,
  Members,
  LifetimeStats,
  GranteeMap,
  StatsSentence,
  NewsletterSignup,
  ViewHeartbeatButton,
  MediaKit,
  MediaKitDownloadLink,
  MediaKitColors,
}
