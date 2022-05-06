import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import AideIcon from '../../assets/icons/aide.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import Logo from '../../assets/images/logo_110.svg'
import NavLink from '../ui/NavLink'

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

  const currentNavLink = (href: string) => router.pathname.startsWith(href)

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
          <NavLink
            isActive={currentNavLink('/mes-jeunes')}
            href='/mes-jeunes'
            label='Mes jeunes'
            iconName='people'
          />

          {!isPoleEmploi && (
            <NavLink
              isActive={currentNavLink('/mes-rendezvous')}
              href='/mes-rendezvous'
              label='Rendez-vous'
              iconName='rendezvous'
            />
          )}

          {isSuperviseur && (
            <>
              <NavLink
                iconName='supervision'
                label='Supervision'
                href='/supervision'
                isActive={currentNavLink('/supervision')}
              />
            </>
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
            <span className='text-md text-bleu_nuit text-center layout_m:sr-only'>
              Aide
            </span>
          </a>
        </div>

        <NavLink
          isActive={currentNavLink('/profil')}
          href='/profil'
          label={session && session!.user.name}
          iconName='person'
        />
      </nav>

      {/*TODO: create spacing component*/}
      <div className='mb-8'></div>
      <div className='flex p-2 m-2 items-center layout_m:justify-center'>
        <Link href={'/api/logout'}>
          <a
            onClick={handleLogout}
            className='mr-2'
            aria-label='Se déconnecter'
          >
            <LogoutIcon aria-hidden='true' focusable='false' />
          </a>
        </Link>
        {session && (
          <p className='text-bleu_nuit layout_m:sr-only'>Déconnexion</p>
        )}
      </div>
    </div>
  )
}
