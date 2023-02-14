import { useRouter } from 'next/router'
import React from 'react'

import ActualitesMenuButton from 'components/ActualitesMenuButton'
import NavLink from 'components/ui/Form/NavLink'
import { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useLeanBeWidget } from 'utils/hooks/useLeanBeWidget'

export enum NavItem {
  Jeunes = 'Jeunes',
  Rdvs = 'Rdvs',
  RechercheOffres = 'RechercheOffres',
  Supervision = 'Supervision',
  Aide = 'Aide',
  Profil = 'Profil',
  Actualites = 'Actualites',
  Raccourci = 'Raccourci,',
  Messagerie = 'Messagerie',
  Pilotage = 'Pilotage',
}
type NavLinksProps = { showLabelsOnSmallScreen: boolean; items: NavItem[] }
export default function NavLinks({
  showLabelsOnSmallScreen,
  items,
}: NavLinksProps) {
  const router = useRouter()
  const [conseiller] = useConseiller()

  const isMilo = conseiller?.structure === StructureConseiller.MILO
  const isPoleEmploi = conseiller?.structure === StructureConseiller.POLE_EMPLOI
  const isSuperviseur = conseiller?.estSuperviseur

  const isCurrentRoute = (href: string) => router.pathname.startsWith(href)

  async function trackLogout() {
    trackEvent({
      structure: conseiller!.structure,
      categorie: 'Session',
      action: 'Déconnexion',
      nom: '',
    })
  }

  useLeanBeWidget(conseiller?.structure)

  return (
    <>
      <div>
        {items.includes(NavItem.Jeunes) && (
          <NavLink
            isActive={isCurrentRoute('/mes-jeunes')}
            href='/mes-jeunes'
            label='Portefeuille'
            iconName={IconName.People}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {!isPoleEmploi && items.includes(NavItem.Rdvs) && (
          <NavLink
            isActive={isCurrentRoute('/agenda')}
            href='/agenda'
            label='Agenda'
            iconName={IconName.RendezVous}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {items.includes(NavItem.RechercheOffres) && (
          <NavLink
            isActive={
              isCurrentRoute('/recherche-offres') || isCurrentRoute('/offres')
            }
            href='/recherche-offres'
            label='Offres'
            iconName={IconName.Search}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {items.includes(NavItem.Pilotage) && (
          <>
            <NavLink
              iconName={IconName.Board}
              label='Pilotage'
              href='/pilotage'
              isActive={isCurrentRoute('/pilotage')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          </>
        )}

        {isSuperviseur && items.includes(NavItem.Supervision) && (
          <>
            <NavLink
              iconName={IconName.ArrowRight}
              label='Réaffectation'
              href='/reaffectation'
              isActive={isCurrentRoute('/reaffectation')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          </>
        )}

        {items.includes(NavItem.Messagerie) && (
          <>
            <NavLink
              iconName={IconName.Note}
              label='Messagerie'
              href='/mes-jeunes'
              isActive={isCurrentRoute('/mes-jeunes')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          </>
        )}

        {items.includes(NavItem.Raccourci) && (
          <>
            <NavLink
              iconName={IconName.Add}
              label='Créer un raccourci'
              href='/raccourci'
              isActive={isCurrentRoute('/raccourci')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          </>
        )}

        {items.includes(NavItem.Actualites) && (
          <ActualitesMenuButton structure={conseiller?.structure} />
        )}

        {items.includes(NavItem.Aide) && (
          <NavLink
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
        {conseiller && items.includes(NavItem.Profil) && (
          <NavLink
            isActive={isCurrentRoute('/profil')}
            href='/profil'
            label={`${conseiller.firstName} ${conseiller.lastName}`}
            iconName={IconName.Profil}
            className='break-all'
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}
        <span className='border-b border-blanc mx-4 mb-8'></span>
        <NavLink
          href='/api/auth/federated-logout'
          label='Déconnexion'
          iconName={IconName.Logout}
          onClick={trackLogout}
          showLabelOnSmallScreen={showLabelsOnSmallScreen}
        />
      </div>
    </>
  )
}
