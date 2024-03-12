import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type NavLinkProps = {
  label: string | null
  iconName: IconName
  showLabelOnSmallScreen: boolean
  badgeLabel?: string
  href?: string
  isActive?: boolean
  className?: string
  isExternal?: boolean
  onClick?: () => void
}

export default function NavLink({
  isActive,
  label,
  href,
  iconName,
  className,
  isExternal = false,
  badgeLabel,
  showLabelOnSmallScreen = false,
  onClick,
}: NavLinkProps) {
  const linkStyle = `flex w-full p-2 mb-2 items-center layout_base:justify-center rounded-base layout_s:justify-start layout_l:justify-start transition-all border-2  ${
    isActive
      ? 'bg-primary_lighten border-blanc text-base-bold'
      : 'border-primary hover:border-blanc text-base-medium'
  }`

  const linkContent: React.JSX.Element = (
    <>
      {showLabelOnSmallScreen && (
        <>
          <IconComponent
            focusable={false}
            aria-hidden={true}
            className={`w-6 h-6 mr-2 ${
              isActive ? 'fill-primary' : 'fill-blanc'
            }`}
            name={iconName}
          />
          <div className='relative text-left'>
            <span
              className={`break-words ${className ?? ''} ${
                isActive ? 'text-primary' : 'text-blanc'
              }`}
            >
              {label}
            </span>
            {badgeLabel && <BadgeNavLink label={badgeLabel} />}
          </div>
        </>
      )}

      {!showLabelOnSmallScreen && (
        <>
          <IconComponent
            focusable={false}
            aria-hidden={true}
            className={`mr-0 w-4 h-4 layout_base:w-6 layout_base:h-6 layout_l:mr-2 ${
              isActive ? 'fill-primary' : 'fill-blanc'
            }`}
            name={iconName}
          />
          <div className='relative text-left'>
            <span
              className={`sr-only layout_l:not-sr-only break-words relative ${
                className ?? ''
              } ${isActive ? 'text-primary' : 'text-blanc'}`}
            >
              {label}
            </span>
            {badgeLabel && <BadgeNavLink label={badgeLabel} />}
          </div>
        </>
      )}
    </>
  )

  return (
    <li>
      {href && !isExternal && (
        <Link href={href} className={linkStyle} onClick={onClick}>
          {linkContent}
        </Link>
      )}

      {href && isExternal && (
        <a
          href={href}
          target='_blank'
          rel='noreferrer noopener'
          aria-label={`${label} (nouvelle fenêtre)`}
          className={linkStyle + ' cursor-pointer'}
          onClick={onClick}
        >
          {linkContent} <span className='sr-only'>(nouvelle fenêtre)</span>
          <IconComponent
            name={IconName.OpenInNew}
            aria-hidden={true}
            focusable={false}
            className='mx-2 w-4 h-4 fill-blanc hidden layout_l:block'
          />
        </a>
      )}

      {!href && onClick && (
        <button type='button' className={linkStyle} onClick={onClick}>
          {linkContent}
        </button>
      )}
    </li>
  )
}

function BadgeNavLink({ label }: { label: string }) {
  return (
    <>
      <IconComponent
        focusable={false}
        aria-hidden={false}
        className='w-4 h-4 fill-warning absolute top-0 -right-5 bg-blanc rounded-full'
        name={IconName.Error}
      />
      <span className='sr-only'>{label}</span>
    </>
  )
}
