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
  return (
    <div className='relative rounded-small shadow-s p-6'>
      {withPartage && (
        <div className='absolute right-6'>
          <LienPartageOffre
            titreOffre={titreLien}
            href={`/offres/${offrePath}/partage`}
            style={ButtonStyle.TERTIARY}
          />
        </div>
      )}

      {children}

      <Link href={`/offres/${offrePath}`}>
        <a
          aria-label={`Détail de l’offre ${titreLien}`}
          className='absolute right-6 bottom-6 flex items-center text-s-regular hover:text-primary'
        >
          Voir le détail
          <IconComponent
            name={IconName.ChevronRight}
            className='w-4 h-4 mr-2 fill-primary'
            focusable={false}
            aria-hidden={true}
          />
        </a>
      </Link>
    </div>
  )
}
