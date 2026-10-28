/* eslint-disable react/display-name */
import React from 'react'
import { MDXLayout, ComponentMap } from 'pliny/mdx-components.js'
import { TOCInline } from 'pliny/ui/TOCInline.js'
import { Pre } from 'pliny/ui/Pre.js'
import { BlogNewsletterForm } from 'pliny/ui/NewsletterForm.js'

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
import AuthorLayout from '@/layouts/AuthorLayout'
import FundLayout from '@/layouts/FundLayout'
import NewsletterLayout from '@/layouts/NewsletterLayout'
import PageLayout from '@/layouts/PageLayout'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import ProjectLayout from '@/layouts/ProjectLayout'
import SpotlightLayout from '@/layouts/SpotlightLayout'
import TopicLayout from '@/layouts/TopicLayout'

const layouts = {
  AuthorLayout,
  FundLayout,
  NewsletterLayout,
  PageLayout,
  PostLayout,
  PostSimple,
  ProjectLayout,
  SpotlightLayout,
  TopicLayout,
}

export const Wrapper = ({ layout, content, ...rest }: MDXLayout) => {
  const Layout = layouts[
    layout as keyof typeof layouts
  ] as unknown as React.ComponentType<Record<string, unknown>>
  if (!Layout) {
    throw new Error(`Unknown MDX layout: ${layout}`)
  }
  return <Layout content={content} {...rest} />
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
