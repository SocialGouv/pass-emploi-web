import { useRouter } from 'next/router'
import React, { useState } from 'react'

import Logo from '../../assets/images/logo_app_cej.svg'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import NavbarLink from 'components/ui/NavbarLink'
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
            iconName={IconName.People}
          />

          {!isPoleEmploi && (
            <NavbarLink
              isActive={isCurrentRoute('/mes-rendezvous')}
              href='/mes-rendezvous'
              label='Rendez-vous'
              iconName={IconName.RendezVous}
            />
          )}

          {isSuperviseur && (
            <>
              <NavbarLink
                iconName={IconName.ArrowRight}
                label='Réaffectation'
                href='/reaffectation'
                isActive={isCurrentRoute('/reaffectation')}
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
            className='hover:bg-primary_darken'
          >
            <IconComponent
              name={IconName.Aide}
              aria-hidden={true}
              focusable={false}
              className='mr-2 fill-blanc w-6 h-6 layout_s:w-4 layout_s:h-4'
            />
            <span className='text-md text-blanc text-center layout_base:sr-only'>
              Aide
            </span>
            <IconComponent
              name={IconName.Launch}
              aria-hidden={true}
              focusable={false}
              className='mx-2 w-3 h-3 fill-blanc layout_base:hidden'
            />
          </a>
        </div>
        <div className='flex flex-col'>
          {session && (
            <NavbarLink
              isActive={isCurrentRoute('/profil')}
              href='/profil'
              label={session.user.name}
              iconName={IconName.Profil}
              className='break-all'
            />
          )}
          <span className='border-b border-blanc mx-4 mb-8'></span>
          <NavbarLink
            href='/api/logout'
            label='Déconnexion'
            iconName={IconName.Logout}
            onClick={handleLogout}
          />
        </div>
      </nav>
    </div>
  )
}
