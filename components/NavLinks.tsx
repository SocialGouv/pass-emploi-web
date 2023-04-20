import { useRouter } from 'next/router'
import React from 'react'

import ActualitesMenuButton from 'components/ActualitesMenuButton'
import NavLink from 'components/ui/Form/NavLink'
import { IconName } from 'components/ui/IconComponent'
import {
  estMilo,
  estSuperviseur,
  estPoleEmploi,
  estPoleEmploiBRSA,
} from 'interfaces/conseiller'
import { trackEvent, trackPage } from 'utils/analytics/matomo'
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
  Etablissement = 'Etablissement',
}
type NavLinksProps = { showLabelsOnSmallScreen: boolean; items: NavItem[] }
export default function NavLinks({
  showLabelsOnSmallScreen,
  items,
}: NavLinksProps) {
  const router = useRouter()
  const [conseiller] = useConseiller()

  function isCurrentRoute(href: string) {
    return router.asPath.startsWith(href)
  }

  async function trackLogout() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Session',
      action: 'Déconnexion',
      nom: '',
    })
  }

  async function trackActualite() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Actualite',
      action: 'Click',
      nom: '',
    })
  }

  async function trackAide() {
    trackPage({ structure: conseiller.structure, customTitle: 'Aide' })
  }

  useLeanBeWidget(conseiller)

  return (
    <>
      <div>
        {items.includes(NavItem.Jeunes) && (
          <NavLink
            isActive={isCurrentRoute('/mes-jeunes')}
            href='/mes-jeunes'
            label='Portefeuille'
            iconName={
              isCurrentRoute('/mes-jeunes')
                ? IconName.People
                : IconName.PeopleOutline
            }
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {!estPoleEmploi(conseiller) && items.includes(NavItem.Rdvs) && (
          <NavLink
            isActive={isCurrentRoute('/agenda')}
            href='/agenda'
            label='Agenda'
            iconName={
              isCurrentRoute('/agenda')
                ? IconName.Calendar
                : IconName.CalendarOutline
            }
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
            iconName={
              isCurrentRoute('/recherche-offres') || isCurrentRoute('/offres')
                ? IconName.SearchNav
                : IconName.SearchNavOutline
            }
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {!estPoleEmploi(conseiller) && items.includes(NavItem.Pilotage) && (
          <>
            <NavLink
              iconName={
                isCurrentRoute('/pilotage')
                  ? IconName.Board
                  : IconName.BoardOutline
              }
              label='Pilotage'
              href='/pilotage'
              isActive={isCurrentRoute('/pilotage')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          </>
        )}

        {!estPoleEmploi(conseiller) &&
          items.includes(NavItem.Etablissement) && (
            <NavLink
              iconName={
                isCurrentRoute('/etablissement')
                  ? IconName.RoundedArrowRight
                  : IconName.RoundedArrowRightOutline
              }
              label='Bénéficiaires'
              href='/etablissement'
              isActive={isCurrentRoute('/etablissement')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          )}

        {estSuperviseur(conseiller) && items.includes(NavItem.Supervision) && (
          <NavLink
            iconName={IconName.ArrowRight}
            label='Réaffectation'
            href='/reaffectation'
            isActive={isCurrentRoute('/reaffectation')}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {items.includes(NavItem.Messagerie) && (
          <NavLink
            iconName={IconName.Note}
            label='Messagerie'
            href='/mes-jeunes'
            isActive={isCurrentRoute('/mes-jeunes')}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {items.includes(NavItem.Raccourci) && (
          <NavLink
            iconName={IconName.Add}
            label='Créer un raccourci'
            href='/raccourci'
            isActive={isCurrentRoute('/raccourci')}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {process.env.ENABLE_LEANBE &&
          items.includes(NavItem.Actualites) &&
          !estPoleEmploiBRSA(conseiller) && (
            <ActualitesMenuButton
              conseiller={conseiller}
              onClick={trackActualite}
            />
          )}

        {items.includes(NavItem.Aide) && (
          <NavLink
            href={
              estMilo(conseiller)
                ? process.env.FAQ_MILO_EXTERNAL_LINK ?? ''
                : process.env.FAQ_PE_EXTERNAL_LINK ?? ''
            }
            label='Aide'
            iconName={IconName.Aide}
            isExternal={true}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
            onClick={trackAide}
          />
        )}
      </div>
      <div className='flex flex-col'>
        {items.includes(NavItem.Profil) && (
          <NavLink
            isActive={isCurrentRoute('/profil')}
            href='/profil'
            label={`${conseiller.firstName} ${conseiller.lastName}`}
            iconName={
              isCurrentRoute('/profil')
                ? IconName.Profil
                : IconName.ProfilOutline
            }
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
