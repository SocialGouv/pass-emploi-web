import React from 'react'

import { ID_MENU } from 'components/globals'
import NavLinks, { NavItem } from 'components/NavLinks'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import { estPassEmploi } from 'interfaces/conseiller'
import styles from 'styles/components/Sidebar.module.css'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function Sidebar() {
  const [conseiller] = useConseiller()

  const aThemePassEmploi = estPassEmploi(conseiller)

  return (
    <div className={styles.sidebar}>
      {aThemePassEmploi && (
        <IllustrationComponent
          name={IllustrationName.LogoPassemploi}
          role='img'
          focusable={false}
          aria-label='pass emploi'
          title='pass emploi'
          className='mb-8 mx-auto min-h-[55px] w-[95px] fill-white'
        />
      )}

      {!aThemePassEmploi && (
        <IllustrationComponent
          name={IllustrationName.LogoCEJ}
          role='img'
          focusable={false}
          aria-label='contrat d’engagement jeune'
          title='contrat d’engagement jeune'
          className='mx-auto mb-8 min-h-[64px] w-[120px] fill-white'
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
