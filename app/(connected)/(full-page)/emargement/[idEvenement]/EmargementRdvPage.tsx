'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useEffect } from 'react'

import LogoCEJ from 'assets/images/logo_app_cej.svg'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { Evenement } from 'interfaces/evenement'
import { toFrenchDateTime } from 'utils/date'

function EmargementRdvPage({ evenement }: { evenement: Evenement }) {
  useEffect(() => {
    window.print()
  }, [])

  return (
    <>
      <header className='bg-primary text-blanc flex justify-between py-12 px-8 mb-8 print:page-break-before'>
        <div>
          <h1 className='text-l-bold'>Feuille d’émargement</h1>
          <h2>{evenement.titre}</h2>
        </div>
        <LogoCEJ
          role='img'
          focusable={false}
          aria-label='contrat d’engagement jeune'
          title='contrat d’engagement jeune'
          className='h-[64px] w-[120px] fill-blanc'
        />
      </header>
      <div className='mb-8'>
        <ul>
          <li>
            Atelier
            {' : '}
            <span className='text-base-bold'>{evenement.titre}</span>
          </li>
          <li>
            Créateur{' : '}
            <span className='text-base-bold'>
              {evenement.createur.prenom} {evenement.createur.nom}
            </span>
          </li>
          <li>
            Date et heure{' : '}
            <span className='text-base-bold'>
              {toFrenchDateTime(evenement.date)}
            </span>
          </li>
          <li>
            Adresse{' : '}
            <span className='text-base-bold'>
              {evenement.adresse ?? (
                <>
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </span>
          </li>
        </ul>
      </div>

      <Table
        asDiv={true}
        caption={{
          text: `Nombre de bénéficiaires inscrits`,
          count: evenement.jeunes.length,
          visible: true,
        }}
      >
        <THead>
          <TR isHeader={true}>
            <TH>N°</TH>
            <TH>Prénom NOM</TH>
            <TH>Signature</TH>
          </TR>
        </THead>
        <TBody>
          {evenement.jeunes.map((jeune, key) => (
            <TR key={key}>
              <TD>{key + 1}</TD>
              <TD>
                {jeune.prenom} {jeune.nom}
              </TD>
              <TD className='py-12 border-l border-grey_500'></TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </>
  )
}

export default withTransaction(
  EmargementRdvPage.name,
  'page'
)(EmargementRdvPage)
