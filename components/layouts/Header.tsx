import Logo from '../../assets/icons/logo_PassEmploi.svg'

import styles from 'styles/components/Layouts.module.css'

type HeaderProps = {
}

export default function Header({}: HeaderProps) {
   return (
     <>
       <header role="banner" className={styles.header}>
        <div>
          <Logo role="img" focusable="false" aria-label="Logo de Pass Emploi"/>
          <div aria-hidden="true" style={{textAlign: "center"}}>Conseiller</div>
        </div>
         <p className="h1-semi">Bienvenue sur votre espace conseiller</p>
         <p className="text-lg-semi">Nils</p>
       </header>
     </>
   )
 }