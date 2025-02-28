'use client'

import { DateTime } from 'luxon'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import ActualitesModal from 'components/ActualitesModal'
import NavLink from 'components/ui/Form/NavLink'
import { IconName } from 'components/ui/IconComponent'
import { Article } from 'interfaces/actualites'
import { estSuperviseur, utiliseChat } from 'interfaces/conseiller'
import { estMilo } from 'interfaces/structure'
import { modifierDateVisionnageActus } from 'services/conseiller.service'
import { useActualites } from 'utils/actualitesContext'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
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
  const pathname = usePathname()
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const actualites = useActualites()

  const conseillerEstMilo = estMilo(conseiller.structure)
  const nombreBeneficiairesAArchiver = portefeuille.reduce(
    (count, beneficiaire) => count + Number(beneficiaire.estAArchiver),
    0
  )

  const [afficherActualiteModal, setAfficherActualiteModal] =
    useState<boolean>(false)

  const aDesBeneficiaires = portefeuille.length > 0
  const lienProfilBadgeLabel = !conseiller.email
    ? 'Une information en attente de mise à jour'
    : undefined

  const [countNouvellesActualites, setCountNouvellesActualites] =
    useState<number>()
  const [labelNouvellesActualites, setLabelNouvellesActualites] =
    useState<string>()

  function isCurrentRoute(href: string) {
    return pathname.startsWith(href)
  }

  async function logout() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Session',
      action: 'Déconnexion',
      nom: '',
      aDesBeneficiaires,
    })
    router.push('/api/auth/federated-logout')
  }

  async function trackActualite() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Actualite',
      action: 'Click',
      nom: '',
      aDesBeneficiaires,
    })
  }

  async function ouvrirActualites() {
    setAfficherActualiteModal(true)
    const now = DateTime.now()
    trackActualite()

    modifierDateVisionnageActus(now)
    setConseiller({ ...conseiller, dateVisionnageActus: now.toISO() })
  }

  useEffect(() => {
    if (
      !items.includes(NavItem.Actualites) ||
      process.env.NEXT_PUBLIC_ENABLE_ACTUS !== 'true' ||
      !actualites
    )
      return

    const count = compterNouvellesActualites(
      conseiller.dateVisionnageActus,
      actualites
    )
    if (!count) return

    setCountNouvellesActualites(count)
    if (count > 1)
      setLabelNouvellesActualites(' nouvelles actualités sont disponibles')
    else setLabelNouvellesActualites(' nouvelle actualité est disponible')
  }, [actualites, conseiller.dateVisionnageActus])

  return (
    <>
      <ul>
        {items.includes(NavItem.Jeunes) && (
          <NavLink
            isActive={isCurrentRoute('/mes-jeunes')}
            href='/mes-jeunes'
            className='break-all'
            label='Portefeuille'
            iconName={
              isCurrentRoute('/mes-jeunes')
                ? IconName.PeopleFill
                : IconName.PeopleOutline
            }
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {conseillerEstMilo && items.includes(NavItem.Rdvs) && (
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
            isActive={isCurrentRoute('/offres')}
            href='/offres'
            label='Offres'
            iconName={
              isCurrentRoute('/offres')
                ? IconName.PageViewFill
                : IconName.PageViewOutline
            }
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

        {conseillerEstMilo && items.includes(NavItem.Pilotage) && (
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
            badgeLabel={
              nombreBeneficiairesAArchiver > 0
                ? 'Des actions requièrent votre attention'
                : undefined
            }
          />
        )}

        {conseillerEstMilo && items.includes(NavItem.Etablissement) && (
          <NavLink
            iconName={
              isCurrentRoute('/etablissement')
                ? IconName.ArrowCircleRightFill
                : IconName.ArrowCircleRightOutline
            }
            className='break-all'
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
              className='break-all'
              label='Réaffectation'
              href='/reaffectation'
              isActive={isCurrentRoute('/reaffectation')}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
            />
          )}

        {!conseillerEstMilo &&
          utiliseChat(conseiller) &&
          items.includes(NavItem.Messagerie) && (
            <NavLink
              iconName={
                isCurrentRoute('/messagerie')
                  ? IconName.ChatFill
                  : IconName.ChatOutline
              }
              className='break-all'
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

        {process.env.NEXT_PUBLIC_ENABLE_ACTUS === 'true' &&
          items.includes(NavItem.Actualites) && (
            <NavLink
              label='Actualités'
              iconName={IconName.Notification}
              className='break-all'
              onClick={ouvrirActualites}
              showLabelOnSmallScreen={showLabelsOnSmallScreen}
              badgeCount={countNouvellesActualites}
              badgeLabel={labelNouvellesActualites}
            />
          )}
      </ul>
      <ul className='border-t-2 border-solid border-white pt-2'>
        {items.includes(NavItem.Aide) && (
          <NavLink
            isActive={isCurrentRoute('/aide')}
            href='/aide'
            label='Aide et ressources'
            iconName={IconName.Help}
            showLabelOnSmallScreen={showLabelsOnSmallScreen}
          />
        )}

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
            badgeLabel={lienProfilBadgeLabel}
          />
        )}

        <NavLink
          label='Déconnexion'
          iconName={IconName.Logout}
          className='break-all'
          onClick={logout}
          showLabelOnSmallScreen={showLabelsOnSmallScreen}
        />
      </ul>

      {afficherActualiteModal && (
        <ActualitesModal onClose={() => setAfficherActualiteModal(false)} />
      )}
    </>
  )
}

function compterNouvellesActualites(
  dateVisionnageActus: string | undefined,
  actualites: Article[]
): number {
  if (!dateVisionnageActus) return actualites.length

  return actualites.filter(
    ({ dateDerniereModification }) =>
      DateTime.fromISO(dateVisionnageActus) <
      DateTime.fromISO(dateDerniereModification)
  ).length
}
