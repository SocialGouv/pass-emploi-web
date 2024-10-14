'use client'

import React from 'react'

import NavLinks, { NavItem } from 'components/NavLinks'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import { estPassEmploi } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function Sidebar() {
  const [conseiller] = useConseiller()

  const aThemePassEmploi = estPassEmploi(conseiller)

  return (
    <>
      {aThemePassEmploi && (
        <IllustrationComponent
          name={IllustrationName.LogoPassemploi}
          role='img'
          focusable={false}
          aria-label='pass emploi'
          title='pass emploi'
          className='mb-8 mx-auto w-[95px] fill-white'
        />
      )}

      {!aThemePassEmploi && (
        <IllustrationComponent
          name={IllustrationName.LogoCEJ}
          role='img'
          focusable={false}
          aria-label='contrat d’engagement jeune'
          title='contrat d’engagement jeune'
          className='mb-8 mx-auto h-[64px] w-[120px] fill-white'
        />
      )}

      <nav
        role='navigation'
        aria-label='Menu principal'
        className='grow flex flex-col justify-between'
      >
        <NavLinks
          showLabelsOnSmallScreen={false}
          items={[
            NavItem.Jeunes,
            NavItem.Rdvs,
            NavItem.RechercheOffres,
            NavItem.Reaffectation,
            NavItem.Aide,
            NavItem.Profil,
            NavItem.Actualites,
            NavItem.Pilotage,
            NavItem.Etablissement,
            NavItem.Messagerie,
          ]}
        />
      </nav>
    </>
  )
}
