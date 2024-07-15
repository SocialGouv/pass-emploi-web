import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TD from 'components/ui/Table/TD'

export default function TDLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <TD className='hover:bg-primary_lighten px-4 py-0'>
      <Link href={href} className='block w-full h-full'>
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
