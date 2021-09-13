import Logo from '../../assets/icons/logo_PassEmploi.svg'

import styles from 'styles/components/Layouts.module.css'

type HeaderProps = {
}

export default function Header({}: HeaderProps) {
   return (
     <>
       <header role="banner" className={styles.header}>
        <Logo role="img" focusable="false" width='70px' height='32px' aria-label="Logo de Pass Emploi"/>
          
        <p className="h3-semi">Bienvenue sur votre espace conseiller</p>
        <p className="text-lg-semi">Nils</p>
       </header>
     </>
   )
 }