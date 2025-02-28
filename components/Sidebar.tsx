import React from 'react'

import IllustrationLogoCEJ from 'assets/images/logo_app_cej.svg'
import IllustrationLogoPassemploi from 'assets/images/logo_pass_emploi.svg'
import { ID_MENU } from 'components/globals'
import NavLinks, { NavItem } from 'components/NavLinks'
import { estPassEmploi } from 'interfaces/structure'
import styles from 'styles/components/Sidebar.module.css'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function Sidebar() {
  const [conseiller] = useConseiller()

  const aThemePassEmploi = estPassEmploi(conseiller.structure)

  return (
    <div className={styles.sidebar}>
      {aThemePassEmploi && (
        <IllustrationLogoPassemploi
          aria-hidden={true}
          focusable={false}
          className='mb-8 mx-auto min-h-[55px] w-[95px] fill-white'
        />
      )}

      {!aThemePassEmploi && (
        <IllustrationLogoCEJ
          aria-hidden={true}
          focusable={false}
          className='mx-auto mb-8 min-h-[64px] w-[120px]'
        />
      )}

      <nav
        id={ID_MENU}
        tabIndex={-1}
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
    </div>
  )
}
