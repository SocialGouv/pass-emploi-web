import Link from 'next/link'

import styles from 'styles/components/Layouts.module.css'

import DashboardIcon from '../../assets/icons/dashboard.svg'
import ViewlistIcon from '../../assets/icons/view_list.svg'

type SidebarProps = {
}

export default function Sidebar({}: SidebarProps) {
   return (
      <nav role="navigation" aria-label="Menu principal" className={styles.sidebar}>
        <Link href="/">
          <a>
            <DashboardIcon role="img" focusable="false" aria-label="Aller sur la page d'accueil"/>
            <span className="text-xs text-blanc">Tableau de bord</span>
          </a>
        </Link>
        <Link href="/jeunes/kendji/actions">
          <a>
            <ViewlistIcon role="img" focusable="false" aria-label="Aller sur la liste des actions"/>
            <span className="text-xs text-blanc">Actions</span>
          </a>
        </Link>
      </nav>
   )
 }