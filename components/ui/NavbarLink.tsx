import Link from 'next/link'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface NavLinkProps {
  isActive?: boolean
  href: string
  label: string | null
  iconName: IconName
  className?: string
  onClick?: any
}

function NavbarLink({
  isActive,
  href,
  label,
  iconName,
  className,
  onClick,
}: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        onClick={onClick}
        className={`flex p-2 mb-6 items-center justify-center rounded-medium layout_l:justify-start ${
          isActive ? 'bg-primary_lighten' : 'hover:bg-primary_darken'
        }`}
      >
        {isActive && (
          <span className='text-[24px] font-bold leading-6 text-primary'>
            ·
          </span>
        )}
        <IconComponent
          focusable='false'
          aria-hidden='true'
          className={`mr-0 w-4 h-4 layout_base:w-6 layout_base:h-6 layout_l:mr-2 ${
            isActive ? 'fill-primary' : 'fill-blanc'
          }`}
          name={iconName}
        />
        <span
          className={`text-md text-left sr-only layout_l:not-sr-only break-words ${
            className ?? ''
          } ${isActive ? 'text-primary' : 'text-blanc'}`}
        >
          {label}
        </span>
      </a>
    </Link>
  )
}

export default NavbarLink
