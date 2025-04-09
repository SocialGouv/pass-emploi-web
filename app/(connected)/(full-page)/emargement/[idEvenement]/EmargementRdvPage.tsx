'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useEffect } from 'react'

import IllustrationLogoCEJ from 'assets/images/logo_app_cej.svg'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  compareBeneficiairesByNom,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import { Evenement } from 'interfaces/evenement'
import { Session, StatutBeneficiaire } from 'interfaces/session'
import { toFrenchDateTime } from 'utils/date'

export type EmargementRdvPageProps = {
  evenement: Evenement | Session
  agence?: string
}

function EmargementRdvPage({ evenement, agence }: EmargementRdvPageProps) {
  const isSession = assertIsSession(evenement)
  const inscriptions: Array<IdentiteBeneficiaire> = isSession
    ? evenement.inscriptions
        .filter(
          (beneficiaire) => beneficiaire.statut === StatutBeneficiaire.INSCRIT
        )
        .map((b) => ({
          id: b.idJeune,
          nom: b.nom,
          prenom: b.prenom,
        }))
        .sort(compareBeneficiairesByNom)
    : evenement.jeunes
        .map((b) => ({
          id: b.id,
          nom: b.nom,
          prenom: b.prenom,
        }))
        .sort(compareBeneficiairesByNom)

  useEffect(() => {
    window.print()
  }, [])

  return (
    <>
      <header className='bg-primary text-white flex justify-between py-12 px-8 mb-8 print:page-break-before'>
        <div>
          <h1 className='text-l-bold'>Feuille d’émargement</h1>
          <h2>Mission Locale de {agence}</h2>
        </div>
        <IllustrationLogoCEJ
          aria-hidden={true}
          focusable={false}
          className='h-[64px] w-[120px] fill-white'
        />
      </header>
      <div className='mb-8'>
        <dl>
          {isSession && afficheListeInscritsSession(evenement)}

          {!isSession && afficheListeInscritsAC(evenement)}
        </dl>
      </div>

      <Table
        caption={{
          text: `Nombre de bénéficiaires inscrits`,
          count: inscriptions.length,
          visible: true,
        }}
      >
        <thead>
          <TR isHeader={true}>
            <TH>N°</TH>
            <TH>Prénom NOM</TH>
            <TH>Signature</TH>
          </TR>
        </thead>
        <tbody>
          {inscriptions.map((jeune, key) => (
            <TR key={key} className='shadow-none'>
              <TD className='border border-grey-500'>{key + 1}</TD>
              <TD className='border-y border-grey-500'>
                {jeune.prenom} {jeune.nom}
              </TD>
              <TD className='py-8 border border-grey-500'></TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </>
  )
}

function assertIsSession(evenement: Evenement | Session): evenement is Session {
  return Object.prototype.hasOwnProperty.call(evenement, 'inscriptions')
}

function afficheListeInscritsSession(evenement: Session) {
  return (
    <>
      <div className='mb-2'>
        <dt className='inline'>
          <span>Type : </span>
        </dt>
        <dd className='text-base-bold inline'>{evenement.offre.type}</dd>
      </div>

      <div className='mb-2'>
        <dt className='inline'>
          <span>Titre : </span>
        </dt>
        <dd className='text-base-bold inline'>
          {evenement.offre.titre} - {evenement.session.nom}
        </dd>
      </div>

      <div className='mb-2'>
        <dt className='inline'>
          <span>Animateur : </span>
        </dt>
        <dd className='text-base-bold inline'>
          {evenement.session.animateur ?? (
            <>
              <span aria-hidden={true}>--</span>
              <span className='sr-only'>information non disponible</span>
            </>
          )}
        </dd>
      </div>

      <div className='mb-2'>
        <dt className='inline'>
          <span>Date et heure : </span>
        </dt>
        <dd className='text-base-bold inline'>
          {toFrenchDateTime(evenement.session.dateHeureDebut)}
        </dd>
      </div>
    </>
  )
}

function afficheListeInscritsAC(evenement: Evenement) {
  return (
    <>
      <div className='mb-2'>
        <dt className='inline'>
          <span>Atelier : </span>
        </dt>
        <dd className='text-base-bold inline'>{evenement.titre}</dd>
      </div>

      <div className='mb-2'>
        <dt className='inline'>
          <span>Organisme : </span>
        </dt>
        <dd className='text-base-bold inline'>
          {evenement.organisme ?? (
            <>
              <span aria-hidden={true}>--</span>
              <span className='sr-only'>information non disponible</span>
            </>
          )}
        </dd>
      </div>

      <div className='mb-2'>
        <dt className='inline'>
          <span>Date et heure : </span>
        </dt>
        <dd className='text-base-bold inline'>
          {toFrenchDateTime(evenement.date)}
        </dd>
      </div>

      <div className='mb-2'>
        <dt className='inline'>
          <span>Adresse : </span>
        </dt>
        <dd className='text-base-bold inline'>
          {evenement.adresse ?? (
            <>
              <span aria-hidden={true}>--</span>
              <span className='sr-only'>information non disponible</span>
            </>
          )}
        </dd>
      </div>
    </>
  )
}

export default withTransaction(
  EmargementRdvPage.name,
  'page'
)(EmargementRdvPage)
