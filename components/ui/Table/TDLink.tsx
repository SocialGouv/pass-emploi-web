import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TD from 'components/ui/Table/TD'

export default function TDLink({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  // a11y card : https://kittygiraudel.com/2022/04/02/accessible-cards/
  // absolute position in grandparent : https://stackoverflow.com/a/25768682
  return (
    <TD className={className}>
      <Link
        href={href}
        className='block before:fixed before:inset-0 before:z-10 cursor-pointer'
      >
        <IconComponent
          name={IconName.ChevronRight}
          focusable={false}
          aria-hidden={true}
          title={label}
          className=' w-6 h-6 fill-white rounded-full bg-primary mx-auto'
        />
        <span className='sr-only'>{label}</span>
      </Link>
    </TD>
  )
}
