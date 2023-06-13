import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import EncartAgenceRequise from 'components/EncartAgenceRequise'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import SituationTag from 'components/jeune/SituationTag'
import PageActionsPortal from 'components/PageActionsPortal'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import {
  estMilo,
  estUserPoleEmploi,
  StructureConseiller,
} from 'interfaces/conseiller'
import { getNomJeuneComplet, JeuneEtablissement } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { getAgencesClientSide } from 'services/referentiel.service'
import { MetadonneesPagination } from 'types/pagination'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFullDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

type MissionLocaleProps = PageProps

const Etablissement = (_: MissionLocaleProps) => {
  const initialTracking = `Etablissement`

  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const [recherche, setRecherche] = useState<string>()
  const [resultatsRecherche, setResultatsRecherche] =
    useState<JeuneEtablissement[]>()
  const [metadonnees, setMetadonnees] = useState<MetadonneesPagination>()
  const [pageCourante, setPageCourante] = useState<number>()

  const conseillerEstMilo = estMilo(conseiller)

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function rechercherJeunes(input: string, page: number) {
    if (!input) {
      setResultatsRecherche(undefined)
      setMetadonnees(undefined)
    } else if (nouvelleRecherche(input, page)) {
      const { rechercheJeunesDeLEtablissement } = await import(
        'services/jeunes.service'
      )
      const resultats = await rechercheJeunesDeLEtablissement(
        conseiller.agence!.id!,
        input,
        page
      )
      setResultatsRecherche(resultats.jeunes)
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

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      <PageActionsPortal>
        <ButtonLink href='/reaffectation'>
          Réaffecter des bénéficiaires
        </ButtonLink>
      </PageActionsPortal>
      {Boolean(conseiller.agence) && (
        <RechercheJeune
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
              </TR>
            </THead>
            <TBody>
              {resultatsRecherche!.map((jeune) => (
                <TR
                  key={jeune.base.id}
                  href={'etablissement/beneficiaires/' + jeune.base.id}
                  label={
                    'Accéder à la fiche de ' + getNomJeuneComplet(jeune.base)
                  }
                >
                  <TD isBold>{getNomJeuneComplet(jeune.base)}</TD>
                  {conseillerEstMilo && (
                    <TD>
                      {jeune.situation && (
                        <SituationTag situation={jeune.situation} />
                      )}
                    </TD>
                  )}
                  <TD>{toFullDate(jeune.dateDerniereActivite)}</TD>
                  <TD>
                    <span className='flex items-center'>
                      <div className='relative w-fit mx-auto'>
                        {jeune.referent.prenom} {jeune.referent.nom}
                      </div>
                      <IconComponent
                        focusable={false}
                        aria-hidden={true}
                        className='w-4 h-4 fill-content_color'
                        name={IconName.ChevronRight}
                      />
                    </span>
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
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (estUserPoleEmploi(user)) return { notFound: true }

  return {
    props: {
      pageTitle: 'Établissement',
      pageHeader:
        'Rechercher un bénéficiaire de ' +
        (user.structure === StructureConseiller.MILO
          ? 'ma Mission Locale'
          : 'mon agence'),
    },
  }
}

export default withTransaction(Etablissement.name, 'page')(Etablissement)
