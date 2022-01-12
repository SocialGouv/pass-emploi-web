import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from 'styles/components/Layouts.module.css'
import RendezvousIcon from '../../assets/icons/rendez-vous.svg'
import Logo from '../../assets/icons/logo_PassEmploi.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import AideIcon from '../../assets/icons/aide.svg'
import useMatomo from 'utils/analytics/useMatomo'
import { useState } from 'react'
import { UserStructure } from 'interfaces/conseiller'

type SidebarProps = {}

export default function Sidebar({}: SidebarProps) {
  const router = useRouter()
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const { data: session } = useSession({ required: true })

  const isMilo = session?.user.structure === UserStructure.MILO

  async function handleLogout(event: any) {
    event.preventDefault()
    setIsLoggedOut(true)
    window.location.href = '/api/auth/federated-logout'
  }

  useMatomo(isLoggedOut ? 'Clic déconnexion' : undefined)

  return (
    <div className={styles.sidebar}>
      <div>
        <Logo
          role='img'
          focusable='false'
          className='mb-[30px] mx-auto'
          aria-label='Logo de Pass Emploi'
        />

        <nav role='navigation' aria-label='Menu principal'>
          {isMilo && (
            <Link href='/'>
              <a className={router.pathname === '/' ? styles.activeLink : ''}>
                <RendezvousIcon
                  role='img'
                  focusable='false'
                  aria-label="Aller sur la page d'accueil"
                  className='mr-2'
                />
                <span className='text-md text-bleu_nuit'>Rendez-vous</span>
              </a>
            </Link>
          )}

          <Link href={'/mes-jeunes'}>
            <a
              className={
                router.pathname.startsWith('/mes-jeunes')
                  ? styles.activeLink
                  : ''
              }
            >
              <PeopleIcon
                role='img'
                focusable='false'
                aria-label='Aller sur la liste de mes bénéficiaires'
                className='mr-2'
              />
              <span className='text-md text-bleu_nuit text-center'>
                Mes jeunes
              </span>
            </a>
          </Link>

          <a
            href={
              isMilo
                ? process.env.FAQ_MILO_EXTERNAL_LINK
                : process.env.FAQ_PE_EXTERNAL_LINK
            }
            target='_blank'
            rel='noreferrer noopener'
          >
            <AideIcon
              role='img'
              focusable='false'
              aria-label='Aller sur la page Aide - nouvel onglet'
              className='mr-2'
            />
            <span className='text-md text-bleu_nuit text-center'>Aide</span>
          </a>
        </nav>
      </div>

      <div className='flex justify-between'>
        {session && (
          <p className='text-lg-semi text-bleu_nuit'>{session!.user.name}</p>
        )}

        <Link href={'/api/logout'}>
          <a
            onClick={handleLogout}
            className='mr-2'
            aria-label='Se déconnecter'
          >
            <LogoutIcon
              role='img'
              focusable='false'
              aria-label='Se déconnecter'
            />
          </a>
        </Link>
      </div>
    </div>
  )
}
