import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface ExternalLinkProps {
  href: string
  label: string
  iconName?: IconName
  onClick: () => void
}

export default function ExternalLink({
  href,
  label,
  iconName,
  onClick,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer noopener'
      className='flex items-center whitespace-nowrap underline text-[inherit] hover:text-[inherit]'
      aria-label={`${label} (nouvelle fenêtre)`}
      onClick={onClick}
    >
      {label}
      <IconComponent
        name={iconName ?? IconName.Launch}
        className='ml-1.5 w-3 h-3 fill-[currentColor]'
        focusable='false'
        aria-hidden={true}
      />
    </a>
  )
}
