import Link from 'next/link'
import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type NavLinkProps = {
  label: string | null
  iconName: IconName
  showLabelOnSmallScreen: boolean
  badgeLabel?: string
  badgeCount?: number
  href?: string
  isActive?: boolean
  className?: string
  onClick?: () => void
}

export default function NavLink({
  isActive,
  label,
  href,
  iconName,
  className,
  badgeLabel,
  badgeCount,
  showLabelOnSmallScreen = false,
  onClick,
}: NavLinkProps) {
  const linkStyle = `relative flex w-full p-2 mb-2 items-center justify-center rounded-base layout-l:justify-start transition-all border-2  ${
    isActive
      ? 'bg-primary-lighten border-white text-base-bold'
      : 'border-primary hover:border-white text-base-medium'
  }`

  function LinkContent(): ReactElement {
    return (
      <>
        <IconComponent
          focusable={false}
          aria-hidden={true}
          className={`w-6 h-6 ${showLabelOnSmallScreen ? 'mr-2' : 'mr-0 layout-l:mr-2'} ${
            isActive ? 'fill-primary' : 'fill-white'
          }`}
          name={iconName}
        />
        <span
          className={`${showLabelOnSmallScreen ? '' : 'sr-only layout-l:not-sr-only'} text-left break-words ${className ?? ''} ${
            isActive ? 'text-primary' : 'text-white'
          }`}
        >
          {label}
        </span>

        {badgeLabel && <BadgeNavLink label={badgeLabel} count={badgeCount} />}
      </>
    )
  }

  return (
    <li>
      {href && (
        <Link
          aria-current={isActive && 'page'}
          href={href}
          className={linkStyle}
          onClick={onClick}
        >
          <LinkContent />
        </Link>
      )}

      {!href && onClick && (
        <button type='button' className={linkStyle} onClick={onClick}>
          <LinkContent />
        </button>
      )}
    </li>
  )
}

function BadgeNavLink({ label, count }: { label: string; count?: number }) {
  return (
    <>
      {!count && (
        <IconComponent
          focusable={false}
          aria-hidden={true}
          className='w-4 h-4 fill-warning absolute border border-white top-0 left-0 bg-white rounded-full'
          name={IconName.Error}
        />
      )}

      {count && (
        <span className='w-4 h-4 absolute top-0 left-0 rounded-full border border-white bg-warning text-white text-xs-bold leading-none!'>
          {count}
        </span>
      )}

      <span className='sr-only'>{label}</span>
    </>
  )
}
