import Link from 'next/link'
import { useRouter } from 'next/router'

import styles from 'styles/components/Layouts.module.css'

import DashboardIcon from '../../assets/icons/dashboard.svg'
import ViewlistIcon from '../../assets/icons/view_list.svg'

type SidebarProps = {
}

export default function Sidebar({}: SidebarProps) {
  const router = useRouter()

   return (
      <nav role="navigation" aria-label="Menu principal" className={styles.sidebar}>

        <Link href="/">
          <a >
            <div className={router.pathname === '/' ? styles.activeLink : ''}>
              <DashboardIcon role="img" focusable="false" aria-label="Aller sur la page d'accueil"/>
              <span className="text-xs text-blanc">Tableau de bord</span>
            </div>
            
          </a>
        </Link>
      
        <Link href="/actions">
          <a>
            <div className={router.pathname === '/actions' ? styles.activeLink : ''}>
              <ViewlistIcon role="img" focusable="false" aria-label="Aller sur la liste des actions"/>
              <span className="text-xs text-blanc text-center">Actions</span>
            </div>
          </a>
        </Link>

      </nav>
   )
 }