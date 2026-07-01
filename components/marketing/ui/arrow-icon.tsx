import type { Ref } from 'react'

export function ArrowIcon({
  className,
  ref,
}: {
  className?: string
  ref?: Ref<SVGSVGElement>
}) {
  return (
    <svg
      ref={ref}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className={className}
    >
      <path
        d="M4.5 11h13M12 5.5l5.5 5.5-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
