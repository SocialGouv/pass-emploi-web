import React from 'react'

import Logo from 'assets/images/logo_app_cej.svg'
import NavLinks, { NavItem } from 'components/NavLinks'
import styles from 'styles/components/Layouts.module.css'

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Logo focusable='false' aria-hidden={true} className='mb-8 mx-auto' />
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
          ]}
        />
      </nav>
    </div>
  )
}
