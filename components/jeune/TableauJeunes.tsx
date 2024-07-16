import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { TagDate } from 'components/ui/Indicateurs/Tag'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import {
  getNomBeneficiaireComplet,
  BeneficiaireAvecInfosComplementaires,
  CategorieSituation,
} from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toRelativeDateTime } from 'utils/date'

interface TableauJeunesProps {
  jeunesFiltres: BeneficiaireAvecInfosComplementaires[]
  totalJeunes: number
  withActions: boolean
}

export default function TableauJeunes({
  jeunesFiltres,
  totalJeunes,
  withActions,
}: TableauJeunesProps) {
  const [conseiller] = useConseiller()

  const nombrePagesJeunes = Math.ceil(jeunesFiltres.length / 10)
  const [pageJeunes, setPageJeunes] = useState<number>(1)
  const [jeunesAffiches, setJeunesAffiches] = useState<
    BeneficiaireAvecInfosComplementaires[]
  >([])

  const styleTDTitle = 'flex items-baseline mb-2'

  const beneficiaireSituationColumn = 'Bénéficiaire et situation'
  const dateFinCEJColumn = 'Fin de CEJ'
  const actionsColumn = 'Actions créées'
  const rdvColumn = 'Rendez-vous et ateliers'
  const derniereActiviteColumn = 'Dernière activité'
  const voirDetailColumn = 'Voir le détail'

  useEffect(() => {
    setPageJeunes(1)
  }, [jeunesFiltres])

  useEffect(() => {
    setJeunesAffiches(
      jeunesFiltres.slice(10 * (pageJeunes - 1), 10 * pageJeunes)
    )
  }, [jeunesFiltres, pageJeunes])

  useMatomo('Mes jeunes', jeunesFiltres.length > 0)

  function getRowLabel(jeune: BeneficiaireAvecInfosComplementaires) {
    const labelFiche = `Accéder à la fiche de ${jeune.prenom} ${jeune.nom}`
    const labelActivite = jeune.isActivated
      ? `dernière activité ${toRelativeDateTime(jeune.lastActivity!)}`
      : 'non activé'
    const labelMessages = `${jeune.messagesNonLus} messages non lus`

    return `${labelFiche}, ${labelActivite}, ${labelMessages}`
  }

  return (
    <>
      {jeunesFiltres.length === 0 && (
        <>
          <EmptyState
            illustrationName={IllustrationName.People}
            titre='Aucun bénéficiaire trouvé.'
            sousTitre='Recommencez ou modifiez votre recherche.'
          />
        </>
      )}

      {jeunesFiltres.length > 0 && (
        <>
          <Table
            asDiv={true}
            caption={{
              text: 'Liste des bénéficiaires',
              count:
                totalJeunes === jeunesFiltres.length ? totalJeunes : undefined,
              visible: true,
            }}
          >
            <THead estCache={true}>
              <TR isHeader={true}>
                <TH>{beneficiaireSituationColumn}</TH>
                <TH>{dateFinCEJColumn}</TH>

                {withActions && <TH estCliquable={true}>{actionsColumn}</TH>}

                <TH>{rdvColumn}</TH>
                <TH>{derniereActiviteColumn}</TH>
                <TH>{voirDetailColumn}</TH>
              </TR>
            </THead>

            <TBody>
              {jeunesAffiches.map(
                (jeune: BeneficiaireAvecInfosComplementaires) => (
                  <TR
                    key={jeune.id}
                    href={`/mes-jeunes/${jeune.id}`}
                    linkLabel={getRowLabel(jeune)}
                  >
                    <TD isBold className='rounded-l-base'>
                      <span className={styleTDTitle}>
                        {jeune.structureMilo?.id ===
                          conseiller.structureMilo?.id &&
                          jeune.isReaffectationTemporaire && (
                            <span className='self-center mr-2'>
                              <IconComponent
                                name={IconName.Schedule}
                                focusable={false}
                                className='w-4 h-4'
                                role='img'
                                aria-labelledby={`label-beneficiaire-temporaire-${jeune.id}`}
                                title='bénéficiaire temporaire'
                              />
                              <span
                                id={`label-beneficiaire-temporaire-${jeune.id}`}
                                className='sr-only'
                              >
                                bénéficiaire temporaire
                              </span>
                            </span>
                          )}
                        {jeune.structureMilo?.id !==
                          conseiller.structureMilo?.id && (
                          <span className='self-center mr-2'>
                            <IconComponent
                              name={IconName.Error}
                              focusable={false}
                              role='img'
                              aria-labelledby={`label-ml-differente-${jeune.id}`}
                              className='w-4 h-4 fill-warning'
                              title='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre.'
                            />
                            <span
                              id={`label-ml-differente-${jeune.id}`}
                              className='sr-only'
                            >
                              Ce bénéficiaire est rattaché à une Mission Locale
                              différente de la vôtre.
                            </span>
                          </span>
                        )}
                        {getNomBeneficiaireComplet(jeune)}
                      </span>
                      <SituationTag
                        situation={CategorieSituation.SANS_SITUATION}
                      />
                    </TD>

                    <TD>
                      <span
                        className={`${styleTDTitle} text-s-regular text-grey_800`}
                        aria-hidden={true}
                      >
                        {dateFinCEJColumn}
                      </span>
                      <TagDate label='12 août 1999' />
                    </TD>

                    {withActions && (
                      <TD className='border-l-1 border-grey_800'>
                        <span
                          className={`${styleTDTitle} text-s-regular text-grey_800`}
                          aria-hidden={true}
                        >
                          {actionsColumn}
                        </span>
                        <div className='mx-auto text-m-bold'>
                          {jeune.nbActionsNonTerminees}
                        </div>
                      </TD>
                    )}

                    <TD className='rounded-r-base'>
                      <span
                        className={`${styleTDTitle} text-s-regular text-grey_800`}
                        aria-hidden={true}
                      >
                        {rdvColumn}
                      </span>
                      <div className='mx-auto text-m-bold'>12</div>
                    </TD>

                    <TD>
                      <span
                        className={`${styleTDTitle} text-s-regular text-grey_800`}
                        aria-hidden={true}
                      >
                        {derniereActiviteColumn}
                      </span>
                      <div>
                        {jeune.isActivated &&
                          toRelativeDateTime(jeune.lastActivity!)}
                        {!jeune.isActivated && (
                          <span className='text-warning'>
                            Compte non activé
                          </span>
                        )}
                      </div>
                    </TD>
                  </TR>
                )
              )}
            </TBody>
          </Table>

          {nombrePagesJeunes > 1 && (
            <Pagination
              pageCourante={pageJeunes}
              nombreDePages={nombrePagesJeunes}
              allerALaPage={setPageJeunes}
            />
          )}
        </>
      )}
    </>
  )
}
