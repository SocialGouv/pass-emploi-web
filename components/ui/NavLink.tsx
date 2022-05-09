import Link from 'next/link'

import IconComponent from './IconComponent'

interface NavLinkProps {
  isActive?: boolean
  href: string
  label: string | null
  iconName: string
  onClick?: any
}

function NavLink({ isActive, href, label, iconName, onClick }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        onClick={onClick}
        className={` flex ${isActive ? 'bg-primary_lighten' : ''}`}
      >
        {isActive && <span className='text-l-medium text-primary'>·</span>}
        <IconComponent
          focusable='false'
          aria-hidden='true'
          className={`mr-2 fill-blanc ${isActive ? 'fill-primary' : 'inherit'}`}
          name={iconName}
        />
        <span
          className={` text-md text-blanc layout_m:sr-only ${
            isActive ? 'text-primary' : 'inherit'
          }`}
        >
          {label}
        </span>
      </a>
    </Link>
  )
}

export default NavLink
