import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import AideIcon from '../../assets/icons/aide.svg'
import SupervisionIcon from '../../assets/icons/arrow-right.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PeopleIcon from '../../assets/icons/people.svg'
import PersonIcon from '../../assets/icons/person.svg'
import RendezvousIcon from '../../assets/icons/rendez-vous.svg'
import Logo from '../../assets/images/logo_110.svg'

import { UserStructure } from 'interfaces/conseiller'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'

type SidebarProps = {}

export default function Sidebar({}: SidebarProps) {
  const router = useRouter()
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const { data: session } = useSession<true>({ required: true })

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
      <Logo focusable='false' aria-hidden={true} className='mb-8 mx-auto' />

      <nav
        role='navigation'
        aria-label='Menu principal'
        className='grow flex flex-col justify-between'
      >
        <div>
          <Link href={'/mes-jeunes'}>
            <a
              className={
                router.pathname.startsWith('/mes-jeunes') ? 'bg-bleu_blanc' : ''
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
                    ? 'bg-bleu_blanc'
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
                    ? 'bg-bleu_blanc'
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
        </div>

        <Link href='/profil'>
          <a className='text-md text-bleu_nuit text-center'>
            <PersonIcon
              focusable='false'
              aria-hidden='true'
              className='fill-bleu_nuit'
            />
            <span className='ml-2'>Mon profil</span>
          </a>
        </Link>
      </nav>

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
