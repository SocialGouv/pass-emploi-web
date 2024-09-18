'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useEffect, useRef, useState } from 'react'

import EmptyState from 'components/EmptyState'
import EncartAgenceRequise from 'components/EncartAgenceRequise'
import RechercheBeneficiaire from 'components/jeune/RechercheBeneficiaire'
import SituationTag from 'components/jeune/SituationTag'
import PageActionsPortal from 'components/PageActionsPortal'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  BeneficiaireEtablissement,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { estMilo, estSuperviseur } from 'interfaces/conseiller'
import { getAgencesClientSide } from 'services/referentiel.service'
import { MetadonneesPagination } from 'types/pagination'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toRelativeDateTime } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

function EtablissementPage() {
  const initialTracking = 'Etablissement'

  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const tableRef = useRef<HTMLTableElement>(null)

  const [recherche, setRecherche] = useState<string>()
  const [resultatsRecherche, setResultatsRecherche] =
    useState<BeneficiaireEtablissement[]>()
  const [metadonnees, setMetadonnees] = useState<MetadonneesPagination>()
  const [pageCourante, setPageCourante] = useState<number>()

  const conseillerEstMilo = estMilo(conseiller)

  async function rechercherJeunes(input: string, page: number) {
    if (!input) {
      setResultatsRecherche(undefined)
      setMetadonnees(undefined)
    } else if (nouvelleRecherche(input, page)) {
      const { rechercheBeneficiairesDeLEtablissement } = await import(
        'services/jeunes.service'
      )
      const resultats = await rechercheBeneficiairesDeLEtablissement(
        conseiller.agence!.id!,
        input,
        page
      )
      setResultatsRecherche(resultats.beneficiaires)
      setMetadonnees(resultats.metadonnees)
      setPageCourante(page)
    }

    setRecherche(input)
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingTitle(initialTracking + ' - Succès ajout agence')
  }

  function nouvelleRecherche(input: string, page: number) {
    return page !== pageCourante || input !== recherche
  }

  async function trackAgenceModal(trackingMessage: string) {
    setTrackingTitle(initialTracking + ' - ' + trackingMessage)
  }

  useEffect(() => {
    if (resultatsRecherche?.length) tableRef.current!.focus()
  }, [resultatsRecherche])

  useMatomo(trackingTitle, portefeuille.length > 0)

  return (
    <>
      {estSuperviseur(conseiller) && (
        <PageActionsPortal>
          <ButtonLink href='/reaffectation'>
            Réaffecter des bénéficiaires
          </ButtonLink>
        </PageActionsPortal>
      )}

      {Boolean(conseiller.agence) && (
        <RechercheBeneficiaire
          onSearchFilterBy={(input) => rechercherJeunes(input, 1)}
          minCaracteres={2}
        />
      )}

      {!conseiller.agence && (
        <EncartAgenceRequise
          conseiller={conseiller}
          onAgenceChoisie={renseignerAgence}
          getAgences={getAgencesClientSide}
          onChangeAffichageModal={trackAgenceModal}
        />
      )}

      {Boolean(resultatsRecherche?.length) && (
        <div className='mt-6'>
          <Table
            ref={tableRef}
            caption={{
              text: `Résultat de recherche`,
              count: resultatsRecherche!.length,
              visible: true,
            }}
          >
            <thead>
              <TR isHeader={true}>
                <TH>Bénéficiaire</TH>
                {conseillerEstMilo && <TH>Situation</TH>}
                <TH>Dernière activité</TH>
                <TH>Conseiller</TH>
                <TH>Voir le détail</TH>
              </TR>
            </thead>
            <tbody>
              {resultatsRecherche!.map((jeune) => (
                <TR key={jeune.base.id}>
                  <TD isBold>{getNomBeneficiaireComplet(jeune.base)}</TD>
                  {conseillerEstMilo && (
                    <TD>
                      {jeune.situation && (
                        <SituationTag situation={jeune.situation} />
                      )}
                    </TD>
                  )}
                  <TD>
                    {jeune.dateDerniereActivite &&
                      toRelativeDateTime(jeune.dateDerniereActivite)}
                  </TD>
                  <TD>
                    <div className='flex items-center relative w-fit'>
                      {jeune.referent.prenom} {jeune.referent.nom}
                    </div>
                  </TD>
                  <TDLink
                    href={'etablissement/beneficiaires/' + jeune.base.id}
                    label={
                      'Accéder à la fiche de ' +
                      getNomBeneficiaireComplet(jeune.base)
                    }
                  />
                </TR>
              ))}
            </tbody>
          </Table>

          {metadonnees!.nombrePages > 1 && (
            <Pagination
              nomListe='bénéficiaires'
              pageCourante={pageCourante!}
              nombreDePages={metadonnees!.nombrePages}
              allerALaPage={(page) => rechercherJeunes(recherche!, page)}
            />
          )}
        </div>
      )}

      {resultatsRecherche?.length === 0 && (
        <EmptyState
          shouldFocus={true}
          illustrationName={IllustrationName.People}
          titre='Aucun bénéficiaire trouvé.'
          sousTitre='Recommencez ou modifiez votre recherche.'
        />
      )}
    </>
  )
}

export default withTransaction(
  EtablissementPage.name,
  'page'
)(EtablissementPage)
