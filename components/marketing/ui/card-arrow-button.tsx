import Link from 'next/link'
import { ArrowIcon } from './arrow-icon'

const BASE_CLASSES =
  'absolute bottom-3 right-3 size-12 rounded-full bg-white border border-white flex items-center justify-center shadow-sm transition-opacity duration-150 group-hover:opacity-80'

const ICON_CLASSES = 'text-black size-5 transition-transform duration-150 group-hover:rotate-[-25deg]'

interface CardArrowButtonProps {
  href?: string
  ariaLabel?: string
}

/** Overlay arrow control shown bottom-right on directory card cover images. */
export function CardArrowButton({ href, ariaLabel }: CardArrowButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        prefetch={false}
        aria-label={ariaLabel}
        className={`group ${BASE_CLASSES} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black`}
      >
        <ArrowIcon className={ICON_CLASSES} />
      </Link>
    )
  }

  return (
    <span className={BASE_CLASSES} aria-hidden="true">
      <ArrowIcon className={ICON_CLASSES} />
    </span>
  )
}
