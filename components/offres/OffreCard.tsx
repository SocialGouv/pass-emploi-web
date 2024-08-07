import Link from 'next/link'
import React, { ReactNode } from 'react'

import LienPartageOffre from 'components/offres/LienPartageOffre'
import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface OffreCardProps {
  offrePath: string
  titreLien: string
  children: ReactNode
  withPartage?: boolean
}

export default function OffreCard({
  offrePath,
  titreLien,
  children,
  withPartage = false,
}: OffreCardProps) {
  const hrefDetail = '/offres/' + offrePath

  return (
    // a11y card : https://kittygiraudel.com/2022/04/02/accessible-cards/
    // absolute position in grandparent : https://stackoverflow.com/a/25768682
    <div className='relative block rounded-base shadow-base p-6 cursor-pointer hover:bg-primary_lighten rotate-0'>
      {children}

      <Link
        href={hrefDetail}
        className='absolute right-6 bottom-6 flex items-center text-s-regular underline hover:text-primary before:fixed before:inset-0 before:z-10'
        onClick={(e) => e.stopPropagation()}
      >
        Voir le détail <span className='sr-only'>de l’offre {titreLien}</span>
        <IconComponent
          name={IconName.ChevronRight}
          className='w-4 h-4 mr-2 fill-primary'
          focusable={false}
          aria-hidden={true}
        />
      </Link>

      {withPartage && (
        <div className='absolute top-6 right-6 z-20'>
          <LienPartageOffre
            titreOffre={titreLien}
            href={`${hrefDetail}/partage`}
            style={ButtonStyle.SECONDARY}
          />
        </div>
      )}
    </div>
  )
}
