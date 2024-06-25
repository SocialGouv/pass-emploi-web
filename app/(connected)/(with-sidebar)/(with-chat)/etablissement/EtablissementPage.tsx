'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useState } from 'react'

import EncartAgenceRequise from 'components/EncartAgenceRequise'
import { RechercheBeneficiaire } from 'components/jeune/RechercheBeneficiaire'
import SituationTag from 'components/jeune/SituationTag'
import PageActionsPortal from 'components/PageActionsPortal'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import {
  getNomBeneficiaireComplet,
  BeneficiaireEtablissement,
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
            asDiv={true}
            caption={{
              text: `Résultat de recherche`,
              count: resultatsRecherche!.length,
              visible: true,
            }}
          >
            <THead>
              <TR isHeader={true}>
                <TH>Bénéficiaire</TH>
                {conseillerEstMilo && <TH>Situation</TH>}
                <TH>Dernière activité</TH>
                <TH>Conseiller</TH>
                <TH>Voir le détail</TH>
              </TR>
            </THead>
            <TBody>
              {resultatsRecherche!.map((jeune) => (
                <TR
                  key={jeune.base.id}
                  href={'etablissement/beneficiaires/' + jeune.base.id}
                  linkLabel={
                    'Accéder à la fiche de ' +
                    getNomBeneficiaireComplet(jeune.base)
                  }
                >
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
                </TR>
              ))}
            </TBody>
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
        <>
          <IllustrationComponent
            name={IllustrationName.People}
            focusable={false}
            aria-hidden={true}
            className='m-auto w-[200px] h-[200px] [--secondary-fill:theme(colors.grey\_100)]'
          />
          <p className='text-base-bold text-center'>
            Aucun bénéficiaire ne correspond à votre recherche.
          </p>
        </>
      )}
    </>
  )
}

export default withTransaction(
  EtablissementPage.name,
  'page'
)(EtablissementPage)
