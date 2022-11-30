import Link from 'next/link'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type MenuLinkProps = {
  label: string | null
  iconName: IconName
  showLabelOnSmallScreen: boolean
  isActive?: boolean
  className?: string
  isExternal?: boolean
} & ({ href: string } | { onClick: () => void })

export default function MenuLink({
  isActive,
  label,
  iconName,
  className,
  isExternal = false,
  showLabelOnSmallScreen = false,
  ...props
}: MenuLinkProps) {
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
      {isLink(props) && (
        <>
          {!isExternal && (
            <Link href={props.href}>
              <a className={linkStyle}>{linkContent}</a>
            </Link>
          )}

          {isExternal && (
            <a
              href={props.href}
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
      )}

      {!isLink(props) && (
        <button type='button' onClick={props.onClick} className={linkStyle}>
          {linkContent}
        </button>
      )}
    </>
  )
}

function isLink(
  props: { href: string } | { onClick: () => void }
): props is { href: string } {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}
