import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagDate } from 'components/ui/Indicateurs/Tag'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  BeneficiaireAvecInfosComplementaires,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toLongMonthDate, toRelativeDateTime, toShortDate } from 'utils/date'

interface TableauBeneficiairesMiloProps {
  beneficiairesFiltres: BeneficiaireAvecInfosComplementaires[]
  page: number
  total: number
}

export default function TableauBeneficiairesMilo({
  beneficiairesFiltres,
  page,
  total,
}: TableauBeneficiairesMiloProps) {
  const [conseiller] = useConseiller()

  const [beneficiairesAffiches, setBeneficiairesAffiches] = useState<
    BeneficiaireAvecInfosComplementaires[]
  >([])

  const beneficiaireSituationColumn = 'Bénéficiaire et situation'
  const dateFinCEJColumn = 'Fin de CEJ'
  const actionsColumn = 'Actions créées'
  const rdvColumn = 'Rendez-vous et ateliers'
  const derniereActiviteColumn = 'Dernière activité'
  const voirDetailColumn = 'Voir le détail'

  const DEBUT_PERIODE = DateTime.now().startOf('week')
  const FIN_PERIODE = DateTime.now().endOf('week')

  useEffect(() => {
    setBeneficiairesAffiches(
      beneficiairesFiltres.slice(10 * (page - 1), 10 * page)
    )
  }, [beneficiairesFiltres, page])

  useMatomo('Mes jeunes', total > 0)

  return (
    <>
      <h2 className='text-m-bold mb-2 text-center text-grey_800'>
        Semaine du {toShortDate(DEBUT_PERIODE)} au {toShortDate(FIN_PERIODE)}
      </h2>
      <Table
        caption={{
          text: 'Liste des bénéficiaires',
          count: total === beneficiairesFiltres.length ? total : undefined,
          visible: true,
        }}
      >
        <thead className='sr-only'>
          <TR isHeader={true}>
            <TH>{beneficiaireSituationColumn}</TH>
            <TH>{dateFinCEJColumn}</TH>
            <TH estCliquable={true}>{actionsColumn}</TH>
            <TH>{rdvColumn}</TH>
            <TH>{derniereActiviteColumn}</TH>
            <TH>{voirDetailColumn}</TH>
          </TR>
        </thead>

        <tbody className='grid grid-cols-[repeat(5,auto)] layout_m:grid-cols-[repeat(6,auto)] grid-flow-rows gap-y-2'>
          {beneficiairesAffiches.map(
            (beneficiaire: BeneficiaireAvecInfosComplementaires) => (
              <TR
                key={beneficiaire.id}
                className='grid grid-cols-subgrid grid-rows-[repeat(2,auto)] layout_m:grid-rows-[auto] col-span-full items-center'
              >
                <TD isBold className='rounded-tl-base layout_m:rounded-l-base'>
                  <div className='mb-2'>
                    {beneficiaire.structureMilo?.id ===
                      conseiller.structureMilo?.id &&
                      beneficiaire.isReaffectationTemporaire && (
                        <span className='self-center mr-2'>
                          <IconComponent
                            name={IconName.Schedule}
                            focusable={false}
                            className='w-4 h-4'
                            role='img'
                            aria-labelledby={`label-beneficiaire-temporaire-${beneficiaire.id}`}
                            title='bénéficiaire temporaire'
                          />
                          <span
                            id={`label-beneficiaire-temporaire-${beneficiaire.id}`}
                            className='sr-only'
                          >
                            bénéficiaire temporaire
                          </span>
                        </span>
                      )}
                    {beneficiaire.structureMilo?.id !==
                      conseiller.structureMilo?.id && (
                      <span className='self-center mr-2'>
                        <IconComponent
                          name={IconName.Error}
                          focusable={false}
                          role='img'
                          aria-labelledby={`label-ml-differente-${beneficiaire.id}`}
                          className='inline w-4 h-4 fill-warning'
                          title='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre.'
                        />
                        <span
                          id={`label-ml-differente-${beneficiaire.id}`}
                          className='sr-only'
                        >
                          Ce bénéficiaire est rattaché à une Mission Locale
                          différente de la vôtre.
                        </span>
                      </span>
                    )}
                    {getNomBeneficiaireComplet(beneficiaire)}
                  </div>
                  <SituationTag situation={beneficiaire.situationCourante} />
                </TD>

                <TD>
                  <div
                    className='mb-2 text-s-regular text-grey_800'
                    aria-hidden={true}
                  >
                    {dateFinCEJColumn}
                  </div>

                  {beneficiaire.dateFinCEJ && (
                    <TagDate
                      label={toLongMonthDate(
                        DateTime.fromISO(beneficiaire.dateFinCEJ)
                      )}
                    />
                  )}

                  {!beneficiaire.dateFinCEJ && (
                    <>
                      --
                      <span className='sr-only'>
                        information non disponible
                      </span>
                    </>
                  )}
                </TD>

                <TD className='border-l-1 border-grey_800'>
                  <div
                    className='mb-2 text-s-regular text-grey_800'
                    aria-hidden={true}
                  >
                    {actionsColumn}
                  </div>
                  <span className='text-m-bold'>
                    {beneficiaire.nbActionsNonTerminees}
                  </span>
                </TD>

                <TD>
                  <div
                    className='mb-2 text-s-regular text-grey_800'
                    aria-hidden={true}
                  >
                    {rdvColumn}
                  </div>
                  <span className='text-m-bold'>{beneficiaire.rdvs}</span>
                </TD>

                <TD className='row-start-2 col-start-1 col-end-4 rounded-b-base layout_m:rounded-none layout_m:row-start-1 layout_m:col-start-5 layout_m:col-span-1'>
                  <div
                    className='inline layout_m:block mr-8 mb-2 text-s-regular text-grey_800'
                    aria-hidden={true}
                  >
                    {derniereActiviteColumn}
                  </div>
                  <span>
                    {beneficiaire.isActivated &&
                      toRelativeDateTime(beneficiaire.lastActivity!)}
                    {!beneficiaire.isActivated && (
                      <span className='text-warning'>Compte non activé</span>
                    )}
                  </span>
                </TD>

                <TDLink
                  href={`/mes-jeunes/${beneficiaire.id}`}
                  label={`Accéder à la fiche de ${beneficiaire.prenom} ${beneficiaire.nom}`}
                  className='row-span-2'
                />
              </TR>
            )
          )}
        </tbody>
      </Table>
    </>
  )
}
