import React from 'react'

import Sidebar from 'components/Sidebar'
import styles from 'styles/components/Layouts.module.css'

export default function SidebarLayout() {
  return (
    <div className={styles.sidebar}>
      <Sidebar />
    </div>
  )
}
