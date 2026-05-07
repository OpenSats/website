import Link from '@/components/Link'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
} from 'react'

type ActionVariant = 'outline' | 'solid'
type ActionLayout =
  | 'full'
  | 'square'
  | 'desktopSquare'
  | 'mobileTextDesktopSquare'
  | 'mobileSquareDesktopText'

const BASE_ACTION_CLASSES = 'rounded transition-colors'

const VARIANT_CLASSES: Record<ActionVariant, string> = {
  outline:
    'border border-stone-800 bg-transparent text-stone-800 hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:border-white dark:text-white dark:hover:bg-orange-500 dark:hover:text-black',
  solid:
    'border border-stone-800 bg-stone-800 text-white hover:border-transparent hover:bg-orange-500 hover:text-stone-800 dark:bg-white dark:text-black dark:hover:bg-orange-500',
}

const LAYOUT_CLASSES: Record<ActionLayout, string> = {
  full: 'block w-full px-4 py-2 text-center font-semibold sm:w-auto',
  square:
    'inline-flex h-11 w-11 shrink-0 items-center justify-center sm:h-[42px] sm:w-[42px] sm:p-0 sm:leading-none',
  desktopSquare:
    'hidden shrink-0 items-center justify-center sm:inline-flex sm:h-[42px] sm:w-[42px] sm:p-0 sm:leading-none',
  mobileTextDesktopSquare:
    'inline-flex w-full flex-none items-center justify-center gap-2 px-4 py-2 font-semibold sm:h-[42px] sm:w-[42px] sm:gap-0 sm:p-0 sm:leading-none',
  mobileSquareDesktopText:
    'inline-flex h-11 w-11 shrink-0 items-center justify-center gap-0 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm sm:font-semibold sm:leading-6',
}

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ')
}

function getActionClasses(
  variant: ActionVariant,
  layout: ActionLayout,
  className?: string
) {
  return classNames(
    BASE_ACTION_CLASSES,
    VARIANT_CLASSES[variant],
    LAYOUT_CLASSES[layout],
    className
  )
}

type PageActionLinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> & {
  variant?: ActionVariant
  layout?: ActionLayout
}

export function PageActionLink({
  variant = 'outline',
  layout = 'full',
  className,
  ...props
}: PageActionLinkProps) {
  return (
    <Link className={getActionClasses(variant, layout, className)} {...props} />
  )
}

type PageActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionVariant
  layout?: ActionLayout
}

export function PageActionButton({
  variant = 'outline',
  layout = 'full',
  className,
  type = 'button',
  ...props
}: PageActionButtonProps) {
  return (
    <button
      type={type}
      className={getActionClasses(variant, layout, className)}
      {...props}
    />
  )
}
