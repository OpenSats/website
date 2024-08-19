/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'
import { AnchorHTMLAttributes, DetailedHTMLProps } from 'react'
import { cn } from '../utils/cn'

const CustomLink = ({
  href,
  className,
  ...rest
}: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    // @ts-ignore
    return (
      <Link
        href={href}
        className={cn('text-primary hover:text-primary-hover', className)}
        {...rest}
      />
    )
  }

  if (isAnchorLink) {
    return (
      <a href={href} className={cn('text-primary hover:text-primary-hover', className)} {...rest} />
    )
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-primary hover:text-primary-hover', className)}
      href={href}
      {...rest}
    />
  )
}

export default CustomLink
