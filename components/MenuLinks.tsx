import { useRouter } from 'next/router'
import React, { useState } from 'react'

import ActualitesMenuButton from 'components/ActualitesMenuButton'
import MenuLink from 'components/ui/Form/MenuLink'
import { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useLeanBeWidget } from 'utils/useLeanBeWidget'

export enum MenuItem {
  Jeunes = 'Jeunes',
  Rdvs = 'Rdvs',
  RechercheOffres = 'RechercheOffres',
  Supervision = 'Supervision',
  Aide = 'Aide',
  Profil = 'Profil',
  Actualites = 'Actualites',
}
type SidebarProps = { showLabelsOnSmallScreen: boolean; items: MenuItem[] }

export default function MenuLinks({
  showLabelsOnSmallScreen,
  items,
}: SidebarProps) {
  const router = useRouter()
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [conseiller] = useConseiller()

  const isMilo = conseiller?.structure === StructureConseiller.MILO
  const isPoleEmploi = conseiller?.structure === StructureConseiller.POLE_EMPLOI
  const isSuperviseur = conseiller?.estSuperviseur

  const isCurrentRoute = (href: string) => router.pathname.startsWith(href)

  async function handleLogout(event: any) {
    event.preventDefault()
    setIsLoggedOut(true)
    window.location.href = '/api/auth/federated-logout'
  }

  useMatomo(isLoggedOut ? 'Clic déconnexion' : undefined)
  useLeanBeWidget(conseiller?.structure)
  return (
    <>
      <div>
        {items.includes(MenuItem.Jeunes) && (
          <MenuLink
            isActive={isCurrentRoute('/mes-jeunes')}
            href='/mes-jeunes'
            label='Portefeuille'
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

        {items.includes(MenuItem.Actualites) && (
          <ActualitesMenuButton structure={conseiller?.structure} />
        )}
      </div>
      <div className='flex flex-col'>
        {conseiller && items.includes(MenuItem.Profil) && (
          <MenuLink
            isActive={isCurrentRoute('/profil')}
            href='/profil'
            label={`${conseiller.firstName} ${conseiller.lastName}`}
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
    </>
  )
}
