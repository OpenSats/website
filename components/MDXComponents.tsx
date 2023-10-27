/* eslint-disable react/display-name */
import React from 'react'
import { MDXLayout, ComponentMap } from 'pliny/mdx-components'
import { TOCInline } from 'pliny/ui/TOCInline'
import { Pre } from 'pliny/ui/Pre'
import { BlogNewsletterForm } from 'pliny/ui/NewsletterForm'

import Image from './Image'
import VideoPlayer from './VideoPlayer'
import CustomLink from './Link'
import DonateToGeneralFundButton from './DonateToGeneralFundButton'
import DonateToNostrFundButton from './DonateToNostrFundButton'
import DesignTeam from './DesignTeam'
import BoardMembers from './BoardMembers'
import Volunteers from './Volunteers'
import Credits from './Supporters'
import YouTubeEmbed from './YouTubeEmbed'

export const Wrapper = ({ layout, content, ...rest }: MDXLayout) => {
  const Layout = require(`../layouts/${layout}`).default
  return <Layout content={content} {...rest} />
}

export const MDXComponents: ComponentMap = {
  Image,
  VideoPlayer,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  wrapper: Wrapper,
  BlogNewsletterForm,
  DonateToGeneralFundButton,
  DonateToNostrFundButton,
  DesignTeam,
  YouTubeEmbed,
  BoardMembers,
  Volunteers,
  Credits,
}
