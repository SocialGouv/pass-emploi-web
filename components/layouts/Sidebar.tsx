import { useRouter } from 'next/router'
import { useState } from 'react'

import Logo from '../../assets/images/logo_app_cej.svg'
import IconComponent from '../ui/IconComponent'
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

        <NavLink
          isActive={currentNavLink('/profil')}
          href='/profil'
          label={session && session!.user.name}
          iconName='profil'
        />
      </nav>

      {/*TODO: create spacing component*/}
      <div className='mb-8'></div>
      <div className='flex p-2 m-2 items-center layout_m:justify-center'>
        <NavLink
          isActive={currentNavLink('/api/logout')}
          href='/api/logout'
          label='Déconnexion'
          iconName='logout'
          onClick={handleLogout}
        />
      </div>
    </div>
  )
}

//todo: modifier logo et vérifier padding/marges
