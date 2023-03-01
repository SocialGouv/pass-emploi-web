import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import EncartAgenceRequise from 'components/EncartAgenceRequise'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { ReferentielService } from 'services/referentiel.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

type MissionLocaleProps = PageProps

const Etablissement = (_: MissionLocaleProps) => {
  const initialTracking = `Etablissement`

  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const referentielService =
    useDependance<ReferentielService>('referentielService')

  const [conseiller, setConseiller] = useConseiller()
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const [resultatsRecherche, setResultatsRecherche] = useState<BaseJeune[]>()

  async function rechercherJeunes(recherche: string) {
    if (conseiller?.agence?.id) {
      await jeunesService
        .rechercheJeunesDeLEtablissement(conseiller.agence.id, recherche)
        .then(setResultatsRecherche)
    }
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller!, agence })
    setTrackingTitle(initialTracking + ' - Succès ajout agence')
  }

  async function trackAgenceModal(trackingMessage: string) {
    setTrackingTitle(initialTracking + ' - ' + trackingMessage)
  }

  useMatomo(trackingTitle)

  return (
    <>
      {Boolean(conseiller?.agence) && (
        <RechercheJeune onSearchFilterBy={rechercherJeunes} />
      )}

      {conseiller && !conseiller?.agence && (
        <EncartAgenceRequise
          structureConseiller={conseiller.structure}
          onAgenceChoisie={renseignerAgence}
          getAgences={referentielService.getAgencesClientSide.bind(
            referentielService
          )}
          onChangeAffichageModal={trackAgenceModal}
        />
      )}

      {Boolean(resultatsRecherche?.length) && (
        <div className='mt-6'>
          <Table
            asDiv={true}
            caption={{
              text: `Résultat de recherche (${resultatsRecherche!.length})`,
              visible: true,
            }}
          >
            <THead>
              <TR isHeader={true}>
                <TH>
                  <span className='mr-1'>Bénéficiaire</span>
                </TH>
                <TH>
                  <span className='mr-1'></span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {resultatsRecherche!.map((jeune) => (
                <TR key={jeune.id}>
                  <TD isBold className='rounded-l-base'>
                    <span className='flex items-baseline'>
                      {getNomJeuneComplet(jeune)}
                    </span>
                  </TD>
                  <TD>{/* todo va évoluer quand le tableau sera enrichi*/}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      {resultatsRecherche?.length === 0 && (
        <>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='m-auto w-[200px] h-[200px]'
          />
          <p className='text-base-bold text-center'>
            Aucune bénéficiaire ne correspond à votre recherche.
          </p>
        </>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  MissionLocaleProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI)
    return { notFound: true }

  return {
    props: {
      pageTitle:
        user.structure === StructureConseiller.MILO
          ? 'Mission Locale'
          : 'Agence',
    },
  }
}

export default withTransaction(Etablissement.name, 'page')(Etablissement)
