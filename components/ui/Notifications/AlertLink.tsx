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
    <Link
      href={href}
      className='flex items-center text-base-regular whitespace-nowrap underline text-success fill-success hover:text-success-darken'
      onClick={onClick}
    >
      {label}
      <IconComponent
        name={IconName.ChevronRight}
        className='w-5 h-5 fill-[inherit]'
        focusable={false}
        aria-hidden={true}
      />
    </Link>
  )
}
