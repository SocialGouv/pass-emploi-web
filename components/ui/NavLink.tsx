import Link from 'next/link'

import IconComponent from './IconComponent'

interface NavLinkProps {
  isActive: boolean
  href: string
  label: string | null
  iconName: string
}

function NavLink({ isActive, href, label, iconName }: NavLinkProps) {
  return (
    <Link href={href}>
      <a className={isActive ? 'bg-bleu_blanc' : ''}>
        <IconComponent
          focusable='false'
          aria-hidden='true'
          className='mr-2'
          name={iconName}
        />
        <span className='text-md text-bleu_nuit layout_m:sr-only'>{label}</span>
      </a>
    </Link>
  )
}

export default NavLink
