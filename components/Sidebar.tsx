'use client'

import React from 'react'

import LogoCEJ from 'assets/images/logo_app_cej.svg'
import Logo from 'assets/images/logo_pass_emploi.svg'
import NavLinks, { NavItem } from 'components/NavLinks'
import { estPassEmploi } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function Sidebar() {
  const [conseiller] = useConseiller()

  const estConseillerPassEmploi = estPassEmploi(conseiller)

  return (
    <>
      {estConseillerPassEmploi && (
        <Logo
          role='img'
          focusable={false}
          aria-label='pass emploi'
          title='pass emploi'
          className='mb-8 mx-auto fill-blanc'
        />
      )}

      {!estConseillerPassEmploi && (
        <LogoCEJ
          role='img'
          focusable={false}
          aria-label='contrat d’engagement jeune'
          title='contrat d’engagement jeune'
          className='mb-8 mx-auto h-[64px] w-[120px] fill-blanc'
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
