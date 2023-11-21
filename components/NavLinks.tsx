import { useRouter } from 'next/router'
import React from 'react'

import ActualitesMenuButton from 'components/ActualitesMenuButton'
import NavLink from 'components/ui/Form/NavLink'
import { IconName } from 'components/ui/IconComponent'
import {
  estMilo,
  estPoleEmploi,
  estSuperviseur,
  StructureConseiller,
} from 'interfaces/conseiller'
import { trackEvent, trackPage } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useLeanBeWidget } from 'utils/hooks/useLeanBeWidget'
import { usePortefeuille } from 'utils/portefeuilleContext'

export enum NavItem {
  Jeunes = 'Jeunes',
  Rdvs = 'Rdvs',
  RechercheOffres = 'RechercheOffres',
  Reaffectation = 'Reaffectation',
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
  const [portefeuille] = usePortefeuille()

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function isCurrentRoute(href: string) {
    return router.asPath.startsWith(href)
  }

  function getAideHref(structure: StructureConseiller): string {
    switch (structure) {
      case StructureConseiller.MILO:
        return process.env.NEXT_PUBLIC_FAQ_MILO_EXTERNAL_LINK ?? ''
      case StructureConseiller.POLE_EMPLOI:
        return process.env.NEXT_PUBLIC_FAQ_PE_EXTERNAL_LINK ?? ''
      case StructureConseiller.POLE_EMPLOI_BRSA:
        return process.env.NEXT_PUBLIC_FAQ_PE_BRSA_EXTERNAL_LINK ?? ''
      case undefined:
      default:
        return ''
    }
  }

  async function trackLogout() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Session',
      action: 'Déconnexion',
      nom: '',
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  async function trackActualite() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Actualite',
      action: 'Click',
      nom: '',
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  async function trackAide() {
    trackPage({ structure: conseiller.structure, customTitle: 'Aide' })
  }

  useLeanBeWidget(conseiller)

  return (
    <ul>
      <>
        {items.includes(NavItem.Jeunes) && (
          <NavLink
            isActive={isCurrentRoute('/mes-jeunes')}
            href='/mes-jeunes'
            label='Portefeuille'
            iconName={
              isCurrentRoute('/mes-jeunes')
                ? IconName.PeopleFill
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
                ? IconName.EventFill
                : IconName.EventOutline
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
                ? IconName.PageViewFill
                : IconName.PageViewOutline
            }
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {!estPoleEmploi(conseiller) && items.includes(NavItem.Pilotage) && (
          <>
            <NavLink
              iconName={
                isCurrentRoute('/pilotage')
                  ? IconName.LeaderboardFill
                  : IconName.LeaderboardOutline
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
                  ? IconName.ArrowCircleRightFill
                  : IconName.ArrowCircleRightOutline
              }
              label='Bénéficiaires'
              href='/etablissement'
              isActive={isCurrentRoute('/etablissement')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          )}

        {estSuperviseur(conseiller) &&
          items.includes(NavItem.Reaffectation) && (
            <NavLink
              iconName={IconName.ArrowForward}
              label='Réaffectation'
              href='/reaffectation'
              isActive={isCurrentRoute('/reaffectation')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          )}

        {!estMilo(conseiller) && items.includes(NavItem.Messagerie) && (
          <NavLink
            iconName={
              isCurrentRoute('/messagerie')
                ? IconName.ChatFill
                : IconName.ChatOutline
            }
            label='Messagerie'
            href='/messagerie'
            isActive={isCurrentRoute('/messagerie')}
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

        {process.env.NEXT_PUBLIC_ENABLE_LEANBE === 'true' &&
          items.includes(NavItem.Actualites) && (
            <ActualitesMenuButton
              conseiller={conseiller}
              onClick={trackActualite}
            />
          )}

        {items.includes(NavItem.Aide) && (
          <NavLink
            href={getAideHref(conseiller.structure)}
            label='Aide'
            iconName={IconName.Help}
            isExternal={true}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
            onClick={trackAide}
          />
        )}
      </>

      <div className='flex flex-col'>
        {items.includes(NavItem.Profil) && (
          <NavLink
            isActive={isCurrentRoute('/profil')}
            href='/profil'
            label={`${conseiller.firstName} ${conseiller.lastName}`}
            iconName={
              isCurrentRoute('/profil')
                ? IconName.AccountCircleFill
                : IconName.AccountCircleOutline
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
    </ul>
  )
}
