import { UserStructure } from 'interfaces/conseiller'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import AideIcon from '../../assets/icons/aide.svg'
import SupervisionIcon from '../../assets/icons/arrow-right.svg'
import Logo from '../../assets/icons/logo_PassEmploi.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import RendezvousIcon from '../../assets/icons/rendez-vous.svg'

type SidebarProps = {}

export default function Sidebar({}: SidebarProps) {
  const router = useRouter()
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const { data: session } = useSession({ required: true })

  const isMilo = session?.user.structure === UserStructure.MILO
  const isPoleEmploi = session?.user.structure === UserStructure.POLE_EMPLOI
  const isSuperviseur = session?.user.estSuperviseur

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
          <Link href={'/mes-jeunes'}>
            <a
              className={
                router.pathname.startsWith('/mes-jeunes')
                  ? styles.activeLink
                  : ''
              }
            >
              <PeopleIcon
                focusable='false'
                aria-hidden='true'
                className='mr-2'
              />
              <span className='text-md text-bleu_nuit text-center'>
                Mes jeunes
              </span>
            </a>
          </Link>

          {!isPoleEmploi && (
            <Link href={'/mes-rendezvous'}>
              <a
                className={
                  router.pathname.startsWith('/mes-rendezvous')
                    ? styles.activeLink
                    : ''
                }
              >
                <RendezvousIcon
                  focusable='false'
                  aria-hidden='true'
                  className='mr-2'
                />
                <span className='text-md text-bleu_nuit'>Rendez-vous</span>
              </a>
            </Link>
          )}

          {isSuperviseur && (
            <Link href={'/supervision'}>
              <a
                className={
                  router.pathname.startsWith('/supervision')
                    ? styles.activeLink
                    : ''
                }
              >
                <SupervisionIcon
                  focusable='false'
                  aria-hidden='true'
                  className='mr-2'
                />
                <span className='text-md text-bleu_nuit'>Supervision</span>
              </a>
            </Link>
          )}

          <a
            aria-label='Aide (nouvel onglet)'
            href={
              isMilo
                ? process.env.FAQ_MILO_EXTERNAL_LINK
                : process.env.FAQ_PE_EXTERNAL_LINK
            }
            target='_blank'
            rel='noreferrer noopener'
          >
            <AideIcon aria-hidden='true' focusable='false' className='mr-2' />
            <span className='text-md text-bleu_nuit text-center'>Aide</span>
          </a>
        </nav>
      </div>

      <div className='flex justify-between items-center'>
        {session && (
          <p className='text-lg-semi text-bleu_nuit'>{session!.user.name}</p>
        )}

        <Link href={'/api/logout'}>
          <a
            onClick={handleLogout}
            className='mr-2'
            aria-label='Se déconnecter'
          >
            <LogoutIcon aria-hidden='true' focusable='false' />
          </a>
        </Link>
      </div>
    </div>
  )
}
