import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { IconName } from 'components/ui/IconComponent'
import MenuLink from 'components/ui/MenuLink'
import { UserStructure } from 'interfaces/conseiller'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'

export enum MenuItem {
  Jeunes = 'Jeunes',
  Rdvs = 'Rdvs',
  Supervision = 'Supervision',
  Aide = 'Aide',
  Profil = 'Profil',
}
type SidebarProps = { showLabelsOnSmallScreen: boolean; items: MenuItem[] }

export default function Menu({ showLabelsOnSmallScreen, items }: SidebarProps) {
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
    <nav
      role='navigation'
      aria-label='Menu principal'
      className='grow flex flex-col justify-between'
    >
      <div>
        {items.includes(MenuItem.Jeunes) && (
          <MenuLink
            isActive={isCurrentRoute('/mes-jeunes')}
            href='/mes-jeunes'
            label='Mes jeunes'
            iconName={IconName.People}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {!isPoleEmploi && items.includes(MenuItem.Rdvs) && (
          <MenuLink
            isActive={isCurrentRoute('/mes-rendezvous')}
            href='/mes-rendezvous'
            label='Rendez-vous'
            iconName={IconName.RendezVous}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {isSuperviseur && items.includes(MenuItem.Supervision) && (
          <>
            <MenuLink
              iconName={IconName.ArrowRight}
              label='Réaffectation'
              href='/reaffectation'
              isActive={isCurrentRoute('/reaffectation')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          </>
        )}

        {items.includes(MenuItem.Aide) && (
          <MenuLink
            href={
              isMilo
                ? process.env.FAQ_MILO_EXTERNAL_LINK ?? ''
                : process.env.FAQ_PE_EXTERNAL_LINK ?? ''
            }
            label='Aide'
            iconName={IconName.Aide}
            isExternal={true}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}
      </div>
      <div className='flex flex-col'>
        {session && items.includes(MenuItem.Profil) && (
          <MenuLink
            isActive={isCurrentRoute('/profil')}
            href='/profil'
            label={session.user.name}
            iconName={IconName.Profil}
            className='break-all'
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}
        <span className='border-b border-blanc mx-4 mb-8'></span>
        <MenuLink
          href='/api/logout'
          label='Déconnexion'
          iconName={IconName.Logout}
          onClick={handleLogout}
          showLabelOnSmallScreen={showLabelsOnSmallScreen}
        />
      </div>
    </nav>
  )
}
