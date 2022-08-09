import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface AlertLinkProps {
  href: string
  label: string
  onClick: () => void
}

export default function AlertLink({ href, label, onClick }: AlertLinkProps) {
  return (
    <Link href={href} aria-label={label}>
      <a
        className='flex items-center text-s-regular whitespace-nowrap underline text-success fill-success'
        onClick={onClick}
      >
        {label}
        <IconComponent
          name={IconName.ChevronRight}
          className='ml-1.5 w-5 h-5 fill-[inherit]'
          focusable='false'
          aria-hidden={true}
        />
      </a>
    </Link>
  )
}
