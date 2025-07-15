'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import Link from 'next/link'
import React from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { estSuperviseur } from 'interfaces/conseiller'
import { estMilo } from 'interfaces/structure'
import { trackPage } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { liensFooterCEJ, liensFooterPassEmploi } from 'utils/liensFooter'
import { usePortefeuille } from 'utils/portefeuilleContext'

function PlanDuSitePage() {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const conseillerEstSuperviseur = estSuperviseur(conseiller)

  function trackExternalLink(label: string) {
    trackPage({
      customTitle: label,
      structure: conseiller.structure,
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  useMatomo('Plan du site', portefeuille.length > 0)

  return (
    <>
      {estMilo(conseiller.structure) && (
        <LiensMilo
          trackExternalLink={trackExternalLink}
          conseillerEstSuperviseur={conseillerEstSuperviseur}
        />
      )}
      {!estMilo(conseiller.structure) && (
        <LiensFT
          trackExternalLink={trackExternalLink}
          conseillerEstSuperviseur={conseillerEstSuperviseur}
        />
      )}
    </>
  )
}

export default withTransaction(PlanDuSitePage.name, 'page')(PlanDuSitePage)

function LiensMilo({
  trackExternalLink,
  conseillerEstSuperviseur,
}: {
  trackExternalLink: (label: string) => void
  conseillerEstSuperviseur: boolean
}) {
  return (
    <>
      <nav role='navigation' aria-label='Navigation vers les pages internes'>
        <ul className='list-disc text-primary underline mb-4'>
          <li>
            <Link href='/mes-jeunes'>Portefeuille</Link>
            <ul className='list-[circle] ml-4'>
              <li>
                <Link href='/mes-jeunes/creation-jeune'>
                  Ajouter un bénéficiaire
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href='/agenda'>Agenda</Link>
            <ul className='list-[circle] ml-4'>
              <li>
                <Link href='/agenda?onglet=mission-locale'>
                  Agenda - Onglet Agenda Mission Locale
                </Link>
              </li>
              <li>
                <Link href='/agenda?onglet=conseiller'>
                  Agenda - Onglet Mon agenda
                </Link>
              </li>
              <li>
                <Link href='/mes-jeunes/edition-rdv'>Créer un rendez-vous</Link>
              </li>
              <li>
                <Link href='/mes-jeunes/edition-rdv?type=ac'>
                  Créer une animation collective
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href='/offres'>Offres</Link>
          </li>
          <li>
            <Link href='/pilotage'>Pilotage</Link>
            <ul className='list-[circle] ml-4'>
              <li>
                <Link href='/pilotage?onglet=actions'>
                  Pilotage - Onglet Actions
                </Link>
              </li>
              <li>
                <Link href='/pilotage?onglet=animationsCollectives'>
                  Pilotage - Onglet Animations Collectives
                </Link>
              </li>
              <li>
                <Link href='/pilotage?onglet=sessionsImilo'>
                  Pilotage - Onglet Sessions i-milo
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href='/etablissement'>Bénéficiaires</Link>
          </li>
          {conseillerEstSuperviseur && (
            <li>
              <Link href='/reaffectation'>Réaffectation</Link>
            </li>
          )}
          <li>
            <Link href='/aide'>Aide et ressources</Link>
          </li>
          <li>
            <Link href='/profil'>Profil</Link>
          </li>
          <li>
            <Link href='/mes-jeunes/listes'>Mes listes</Link>
            <ul className='list-[circle] ml-4'>
              <li>
                <Link href='/mes-jeunes/listes/edition-liste'>
                  Créer une liste
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href='/mes-jeunes/envoi-message-groupe'>
              Message multi-destinataires
            </Link>
          </li>
        </ul>
      </nav>
      <ul
        className='list-disc text-primary underline'
        aria-label='Liste de liens vers les pages externes'
      >
        {liensFooterCEJ.map(({ url, label }) => (
          <li
            key={label.toLowerCase().replace(/\s/g, '-')}
            className='hover:text-primary-darken'
          >
            <ExternalLink
              key={url}
              href={url}
              label={label}
              onClick={() => trackExternalLink(label)}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

function LiensFT({
  trackExternalLink,
  conseillerEstSuperviseur,
}: {
  trackExternalLink: (label: string) => void
  conseillerEstSuperviseur: boolean
}) {
  return (
    <>
      <nav role='navigation' aria-label='Navigation vers les pages internes'>
        <ul className='list-disc text-primary underline mb-4'>
          <li>
            <Link href='/mes-jeunes'>Portefeuille</Link>
            <ul className='list-[circle] ml-4'>
              <li>
                <Link href='/mes-jeunes/creation-jeune'>
                  Ajouter un bénéficiaire
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href='/offres'>Offres</Link>
          </li>
          {conseillerEstSuperviseur && (
            <li>
              <Link href='/reaffectation'>Réaffectation</Link>
            </li>
          )}
          {Boolean(
            process.env.NEXT_PUBLIC_ENABLE_CVM !== 'true' &&
              !process.env.NEXT_PUBLIC_CVM_EARLY_ADOPTERS
          ) && (
            <li>
              <Link href='/messagerie'>Messagerie</Link>
            </li>
          )}
          <li>
            <Link href='/aide'>Aide et ressources</Link>
          </li>
          <li>
            <Link href='/profil'>Profil</Link>
          </li>
        </ul>
      </nav>
      <ul
        className='list-disc text-primary underline'
        aria-label='Liste de liens vers les pages externes'
      >
        {liensFooterPassEmploi.map(({ url, label }) => (
          <li
            key={label.toLowerCase().replace(/\s/g, '-')}
            className='hover:text-primary-darken'
          >
            <ExternalLink
              key={url}
              href={url}
              label={label}
              onClick={() => trackExternalLink(label)}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
