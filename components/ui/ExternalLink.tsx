import LaunchIcon from '../../assets/icons/launch.svg'
import React from 'react'

interface ExternalLinkProps {
  href: string
  label: string
  onClick: () => void
}

export const ExternalLink = ({ href, label, onClick }: ExternalLinkProps) => {
  return (
    <li className='pr-[1px] mr-4'>
      <a
        href={href}
        target='_blank'
        rel='noreferrer noopener'
        className='flex items-center text-sm-regular text-bleu_nuit whitespace-nowrap underline'
        aria-label={`${label} (nouvelle fenêtre)`}
        onClick={onClick}
      >
        {label}
        <LaunchIcon className='ml-[6px]' focusable='false' aria-hidden={true} />
      </a>
    </li>
  )
}
