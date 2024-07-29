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
import { toLongMonthDate, toRelativeDateTime } from 'utils/date'

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

  const styleTDTitle = 'flex items-baseline mb-2'

  const beneficiaireSituationColumn = 'Bénéficiaire et situation'
  const dateFinCEJColumn = 'Fin de CEJ'
  const actionsColumn = 'Actions créées'
  const rdvColumn = 'Rendez-vous et ateliers'
  const derniereActiviteColumn = 'Dernière activité'
  const voirDetailColumn = 'Voir le détail'

  useEffect(() => {
    setBeneficiairesAffiches(
      beneficiairesFiltres.slice(10 * (page - 1), 10 * page)
    )
  }, [beneficiairesFiltres, page])

  useMatomo('Mes jeunes', total > 0)

  return (
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

      <tbody>
        {beneficiairesAffiches.map(
          (beneficiaire: BeneficiaireAvecInfosComplementaires) => (
            <TR key={beneficiaire.id}>
              <TD isBold className='rounded-l-base'>
                <span className={styleTDTitle}>
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
                        className='w-4 h-4 fill-warning'
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
                </span>
                <SituationTag situation={beneficiaire.situationCourante} />
              </TD>

              <TD>
                <span
                  className={`${styleTDTitle} text-s-regular text-grey_800`}
                  aria-hidden={true}
                >
                  {dateFinCEJColumn}
                </span>

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
                    <span className='sr-only'>information non disponible</span>
                  </>
                )}
              </TD>

              <TD className='border-l-1 border-grey_800'>
                <span
                  className={`${styleTDTitle} text-s-regular text-grey_800`}
                  aria-hidden={true}
                >
                  {actionsColumn}
                </span>
                <div className='mx-auto text-m-bold'>
                  {beneficiaire.nbActionsNonTerminees}
                </div>
              </TD>

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
                  {beneficiaire.isActivated &&
                    toRelativeDateTime(beneficiaire.lastActivity!)}
                  {!beneficiaire.isActivated && (
                    <span className='text-warning'>Compte non activé</span>
                  )}
                </div>
              </TD>
              <TDLink
                href={`/mes-jeunes/${beneficiaire.id}`}
                label={`Accéder à la fiche de ${beneficiaire.prenom} ${beneficiaire.nom}`}
              />
            </TR>
          )
        )}
      </tbody>
    </Table>
  )
}
