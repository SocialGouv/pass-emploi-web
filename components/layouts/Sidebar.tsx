import { useRouter } from 'next/router'
import { useState } from 'react'

import Logo from '../../assets/images/logo_app_cej.svg'
import IconComponent from '../ui/IconComponent'
import NavbarLink from '../ui/NavbarLink'

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

  const isCurrentRoute = (href: string) => router.pathname.startsWith(href)

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
          <NavbarLink
            isActive={isCurrentRoute('/mes-jeunes')}
            href='/mes-jeunes'
            label='Mes jeunes'
            iconName='people'
          />

          {!isPoleEmploi && (
            <NavbarLink
              isActive={isCurrentRoute('/mes-rendezvous')}
              href='/mes-rendezvous'
              label='Rendez-vous'
              iconName='rendezvous'
            />
          )}

          {isSuperviseur && (
            <>
              <NavbarLink
                iconName='supervision'
                label='Supervision'
                href='/supervision'
                isActive={isCurrentRoute('/supervision')}
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
            <IconComponent
              name='aide'
              aria-hidden='true'
              focusable='false'
              className='mr-2 fill-blanc'
            />
            <span className='text-md text-blanc text-center layout_m:sr-only'>
              Aide
            </span>
          </a>
        </div>
        {session && (
          <NavbarLink
            isActive={isCurrentRoute('/profil')}
            href='/profil'
            label={session.user.name}
            iconName='profil'
          />
        )}
      </nav>

      <span className='border-b border-blanc mx-4 mb-8'></span>
      <div className='flex flex-col justify-between'>
        <NavbarLink
          href='/api/logout'
          label='Déconnexion'
          iconName='logout'
          onClick={handleLogout}
        />
      </div>
    </div>
  )
}
