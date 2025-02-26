import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface ExternalLinkProps {
  href: string
  label: string
  onClick: () => void
  iconName?: IconName
  className?: string
}

export default function ExternalLink({
  href,
  label,
  onClick,
  iconName,
  className,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer noopener'
      className={`inline-flex items-center whitespace-nowrap underline text-[inherit] hover:text-[inherit] ${className}`}
      aria-label={`${label} (nouvelle fenêtre)`}
      onClick={onClick}
    >
      {label}
      <IconComponent
        name={iconName ?? IconName.OpenInNew}
        className='ml-1 w-4 h-4 fill-current'
        focusable={false}
        aria-hidden={true}
      />
    </a>
  )
}
