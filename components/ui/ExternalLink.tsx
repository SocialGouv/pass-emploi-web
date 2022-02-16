import LaunchIcon from '../../assets/icons/launch.svg'
import React from 'react'

interface ExternalLinkProps {
  href: string
  label: string
  onClick: () => void
}

export const ExternalLink = ({ href, label, onClick }: ExternalLinkProps) => {
  return (
    <li className='mr-4 text-bleu_nuit fill-bleu_nuit hover:text-primary hover:fill-primary'>
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
    </li>
  )
}
