import React from 'react'

import Logo from 'assets/images/logo_pass_emploi.svg'
import NavLinks, { NavItem } from 'components/NavLinks'
import styles from 'styles/components/Layouts.module.css'

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Logo
        role='img'
        focusable={false}
        aria-label='Pass emploi'
        title='Pass emploi'
        className='mb-8 mx-auto fill-blanc'
      />
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
            NavItem.Supervision,
            NavItem.Aide,
            NavItem.Profil,
            NavItem.Actualites,
            NavItem.Pilotage,
            NavItem.Etablissement,
          ]}
        />
      </nav>
    </div>
  )
}
