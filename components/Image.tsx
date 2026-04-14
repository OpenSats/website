import NextImage, { ImageProps } from 'next/image'

type ThemeImageProps = ImageProps & {
  darkSrc?: string
}

const Image = ({ darkSrc, className, ...rest }: ThemeImageProps) => {
  if (!darkSrc) {
    return <NextImage className={className} {...rest} />
  }

  return (
    <>
      <NextImage className={`${className ?? ''} dark:hidden`} {...rest} />
      <NextImage className={`hidden ${className ?? ''} dark:block`} {...rest} src={darkSrc} />
    </>
  )
}

export default Image
