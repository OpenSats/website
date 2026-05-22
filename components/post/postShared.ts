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

/** Keep in sync with SectionContainer horizontal layout. */
export const postSectionClasses =
  'mx-2 max-w-3xl px-4 sm:px-6 md:mx-auto lg:mx-auto xl:max-w-5xl xl:px-0'

export const postGridClasses = 'xl:grid xl:grid-cols-4 xl:gap-x-6'

/** Spotlight posts use the sidebar grid from 1000px so tablet widths align. */
export const postSpotlightGridClasses =
  'min-[1000px]:grid min-[1000px]:grid-cols-4 min-[1000px]:gap-x-6'
