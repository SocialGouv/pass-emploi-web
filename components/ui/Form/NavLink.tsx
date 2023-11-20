import Link from 'next/link'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type NavLinkProps = {
  label: string | null
  href: string
  iconName: IconName
  showLabelOnSmallScreen: boolean
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
  showLabelOnSmallScreen = false,
  onClick,
}: NavLinkProps) {
  const linkStyle = `flex p-2 mb-6 items-center layout_base:justify-center rounded-base layout_s:justify-start layout_l:justify-start transition-all border-2  ${
    isActive
      ? 'bg-primary_lighten border-blanc text-base-bold'
      : 'border-primary hover:border-blanc text-base-medium'
  }`

  const linkContent: JSX.Element = (
    <>
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
            className={`text-left break-words ${className ?? ''} ${
              isActive ? 'text-primary' : 'text-blanc'
            }`}
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
            className={`text-left sr-only layout_l:not-sr-only break-words ${
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
      <li>
        {!isExternal && (
          <Link href={href} className={linkStyle} onClick={onClick}>
            {linkContent}
          </Link>
        )}

        {isExternal && (
          <a
            href={href}
            target='_blank'
            rel='noreferrer noopener'
            aria-label={`${label} (nouvel onglet)`}
            className={linkStyle}
            onClick={onClick}
          >
            {linkContent}
            <IconComponent
              name={IconName.OpenInNew}
              aria-hidden={true}
              focusable={false}
              className='mx-2 w-4 h-4 fill-blanc hidden layout_l:block'
            />
          </a>
        )}
      </li>
    </>
  )
}
