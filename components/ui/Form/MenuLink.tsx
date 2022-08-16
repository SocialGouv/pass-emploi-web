import Link from 'next/link'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface NavLinkProps {
  href: string
  label: string | null
  iconName: IconName
  showLabelOnSmallScreen: boolean
  isActive?: boolean
  className?: string
  onClick?: any
  isExternal?: boolean
}

function MenuLink({
  isActive,
  href,
  label,
  iconName,
  className,
  onClick,
  isExternal = false,
  showLabelOnSmallScreen = false,
}: NavLinkProps) {
  const linkStyle = `flex p-2 mb-6 items-center layout_base:justify-center rounded-medium layout_s:justify-start layout_l:justify-start ${
    isActive ? 'bg-primary_lighten' : 'hover:bg-primary_darken'
  }`

  const linkContent: JSX.Element = (
    <>
      {isActive && (
        <span className='text-[24px] font-bold leading-6 text-primary'>·</span>
      )}

      {showLabelOnSmallScreen && (
        <>
          <IconComponent
            focusable='false'
            aria-hidden='true'
            className={`w-6 h-6 mr-2 ${
              isActive ? 'fill-primary' : 'fill-blanc'
            }`}
            name={iconName}
          />

          <span
            className={`text-base-medium text-left break-words ${
              className ?? ''
            } ${isActive ? 'text-primary' : 'text-blanc'}`}
          >
            {label}
          </span>
        </>
      )}

      {!showLabelOnSmallScreen && (
        <>
          <IconComponent
            focusable='false'
            aria-hidden='true'
            className={`mr-0 w-4 h-4 layout_base:w-6 layout_base:h-6 layout_l:mr-2 ${
              isActive ? 'fill-primary' : 'fill-blanc'
            }`}
            name={iconName}
          />

          <span
            className={`text-base-medium text-left sr-only layout_l:not-sr-only break-words ${
              className ?? ''
            } ${isActive ? 'text-primary' : 'text-blanc'}`}
          >
            {label}
          </span>
        </>
      )}
    </>
  )
  return (
    <>
      {!isExternal && (
        <Link href={href}>
          <a onClick={onClick} className={linkStyle}>
            {linkContent}
          </a>
        </Link>
      )}

      {isExternal && (
        <a
          href={href}
          target='_blank'
          rel='noreferrer noopener'
          aria-label={`${label} (nouvel onglet)`}
          className={linkStyle}
        >
          {linkContent}
          <IconComponent
            name={IconName.Launch}
            aria-hidden={true}
            focusable={false}
            className='mx-2 w-3 h-3 fill-blanc hidden layout_l:block'
          />
        </a>
      )}
    </>
  )
}

export default MenuLink
