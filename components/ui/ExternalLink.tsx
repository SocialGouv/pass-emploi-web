import React from 'react'

import LaunchIcon from '../../assets/icons/launch.svg'

interface ExternalLinkProps {
  href: string
  label: string
  onClick: () => void
}

export const ExternalLink = ({ href, label, onClick }: ExternalLinkProps) => {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer noopener'
      className='flex items-center text-sm-regular whitespace-nowrap underline text-[inherit]'
      aria-label={`${label} (nouvelle fenêtre)`}
      onClick={onClick}
    >
      {label}
      <LaunchIcon
        className='ml-1.5 fill-[inherit]'
        focusable='false'
        aria-hidden={true}
      />
    </a>
  )
}
