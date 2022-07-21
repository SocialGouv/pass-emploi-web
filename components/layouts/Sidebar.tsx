import React from 'react'

import Logo from 'assets/images/logo_app_cej.svg'
import MenuLinks, { MenuItem } from 'components/MenuLinks'
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
        <MenuLinks
          showLabelsOnSmallScreen={false}
          items={[
            MenuItem.Jeunes,
            MenuItem.Rdvs,
            MenuItem.Supervision,
            MenuItem.Aide,
            MenuItem.Profil,
            MenuItem.Nouveautes,
          ]}
        />
      </nav>
    </div>
  )
}
