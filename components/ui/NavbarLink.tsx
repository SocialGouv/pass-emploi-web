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
        className={`flex mb-6 p-2 layout_base:p-0 ${
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
          className={`mr-2 w-6 h-6 layout_s:w-4 layout_s:h-4 ${
            isActive ? 'fill-primary' : 'fill-blanc'
          }`}
          name={iconName}
        />
        <span
          className={`text-md text-left layout_m:sr-only break-words ${
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
