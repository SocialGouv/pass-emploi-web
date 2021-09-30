import Logo from '../../assets/icons/logo_PassEmploi.svg'

import styles from 'styles/components/Layouts.module.css'
import fetchJson from 'utils/fetchJson'
import { useEffect, useState } from 'react'
import { Conseiller } from 'interfaces'

type HeaderProps = {
}

export default function Header({}: HeaderProps) {
  const [conseillerName, setConseillerName] = useState<String>('')


  useEffect(() => {
    async function fetchConseiller(): Promise<Conseiller> {
      return await fetchJson('/api/user')
    }

    fetchConseiller().then((conseiller) => {
      setConseillerName(conseiller.firstName)
    })
  }, [])

   return (
     <>
       <header role="banner" className={styles.header}>
        <Logo role="img" focusable="false" width='70px' height='32px' aria-label="Logo de Pass Emploi"/>
          
        <p className="h3-semi">Bienvenue sur votre espace conseiller</p>
        <p className="text-lg-semi">{conseillerName}</p>
       </header>
     </>
   )
 }