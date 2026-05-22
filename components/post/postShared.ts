import siteMetadata from '@/data/siteMetadata'

export const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

export const postDateShortTemplate: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

export const editUrl = (path: string) =>
  `${siteMetadata.siteRepo}/blob/master/data/${path}`

export const discussUrl = () =>
  `https://njump.to/npub10pensatlcfwktnvjjw2dtem38n6rvw8g6fv73h84cuacxn4c28eqyfn34f`

/** Spotlight posts: images[0] = OG/social, images[1] = cover hero. */
export const getSpotlightHeroImage = (images?: string[]) => images?.[1]

/** Matches SectionContainer + PostArticleBody grid for aligned spotlight hero text. */
export const postSectionClasses =
  'mx-2 max-w-3xl px-4 sm:px-6 lg:mx-auto xl:mx-auto xl:max-w-5xl xl:px-0'

export const postGridClasses = 'xl:grid xl:grid-cols-4 xl:gap-x-6'
