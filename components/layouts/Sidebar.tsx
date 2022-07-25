import React from 'react'

import Logo from 'assets/images/logo_app_cej.svg'
import Menu, { MenuItem } from 'components/Menu'
import styles from 'styles/components/Layouts.module.css'

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Logo focusable='false' aria-hidden={true} className='mb-8 mx-auto' />
      <Menu
        showLabelsOnSmallScreen={false}
        items={[
          MenuItem.Jeunes,
          MenuItem.Rdvs,
          MenuItem.Supervision,
          MenuItem.Aide,
          MenuItem.Profil,
        ]}
      />
    </div>
  )
}
