import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const hrefDetail = '/offres/' + offrePath

  function goToDetail() {
    router.push(hrefDetail)
  }

  return (
    <div className='relative'>
      <div
        tabIndex={0}
        className='block rounded-base shadow-base p-6 cursor-pointer hover:bg-primary_lighten'
        onClick={goToDetail}
      >
        {children}

        <Link
          href={hrefDetail}
          className='absolute right-6 bottom-6 flex items-center text-s-regular underline hover:text-primary'
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
      </div>

      {withPartage && (
        <div className='absolute top-6 right-6'>
          <LienPartageOffre
            titreOffre={titreLien}
            href={`/offres/${offrePath}/partage`}
            style={ButtonStyle.SECONDARY}
          />
        </div>
      )}
    </div>
  )
}
