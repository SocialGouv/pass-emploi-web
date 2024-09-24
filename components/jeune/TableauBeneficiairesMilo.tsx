import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagDate } from 'components/ui/Indicateurs/Tag'
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

  const dateFinCEJColumn = 'Fin de CEJ'
  const actionsColumn = 'Actions créées'
  const rdvColumn = 'RDV et ateliers'
  const derniereActiviteColumn = 'Dernière activité'

  function getRowLabel(beneficiaire: BeneficiaireAvecInfosComplementaires) {
    const labelFiche = `Accéder à la fiche de ${beneficiaire.prenom} ${beneficiaire.nom}`
    const labelActivite = beneficiaire.isActivated
      ? `dernière activité ${toRelativeDateTime(beneficiaire.lastActivity!)}`
      : 'non activé'
    const labelMessages = `${beneficiaire.messagesNonLus} messages non lus`

    return `${labelFiche}, ${labelActivite}, ${labelMessages}`
  }

  useEffect(() => {
    setBeneficiairesAffiches(
      beneficiairesFiltres.slice(10 * (page - 1), 10 * page)
    )
  }, [beneficiairesFiltres, page])

  useMatomo('Mes jeunes', total > 0)

  return (
    <>
      <thead className='sr-only'>
        <TR isHeader={true}>
          <TH>Bénéficiaire et situation</TH>
          <TH>{dateFinCEJColumn}</TH>
          <TH>{actionsColumn}</TH>
          <TH>{rdvColumn}</TH>
          <TH>{derniereActiviteColumn}</TH>
          <TH>Voir le détail</TH>
        </TR>
      </thead>

      <tbody className='grid grid-cols-[repeat(5,auto)] layout_m:grid-cols-[repeat(6,auto)] gap-y-2'>
        {beneficiairesAffiches.map(
          (beneficiaire: BeneficiaireAvecInfosComplementaires) => (
            <TR
              key={beneficiaire.id}
              className='grid grid-cols-subgrid grid-rows-[repeat(2,auto)] layout_m:grid-rows-[auto] col-span-full items-center'
            >
              <TD
                isBold
                className='h-full !p-2 !rounded-tl-base !rounded-bl-none layout_m:!rounded-l-base'
              >
                <div>
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

              <TD className='relative h-full !p-2 after:content-none after:absolute after:right-0 after:top-4 after:bottom-4 after:border-l-2 after:border-grey_500 layout_m:after:content-[""]'>
                <div
                  className='text-s-regular text-grey_800'
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
                    <span className='sr-only'>information non disponible</span>
                  </>
                )}
              </TD>

              <TD className='h-full !p-2'>
                <div
                  className='text-s-regular text-grey_800'
                  aria-hidden={true}
                >
                  {actionsColumn}
                </div>
                <span className='text-m-bold'>
                  {beneficiaire.actionsCreees}
                </span>
              </TD>

              <TD className='h-full !p-2'>
                <div
                  className='text-s-regular text-grey_800'
                  aria-hidden={true}
                >
                  {rdvColumn}
                </div>
                <span className='text-m-bold'>{beneficiaire.rdvs}</span>
              </TD>

              <TD className='h-full !p-2 row-start-2 col-span-4 flex flex-row justify-start items-baseline gap-4 rounded-bl-base layout_m:row-start-1 layout_m:col-start-5 layout_m:col-span-1 layout_m:rounded-none layout_m:flex-col layout_m:gap-0 layout_m:justify-center layout_m:pt-0'>
                {beneficiaire.isActivated && (
                  <>
                    <span
                      className='text-xs-regular text-grey_800'
                      aria-hidden={true}
                    >
                      {derniereActiviteColumn}
                    </span>
                    <span className='text-s-regular'>
                      {toRelativeDateTime(beneficiaire.lastActivity!)}
                    </span>
                  </>
                )}
                {!beneficiaire.isActivated && (
                  <span className='text-s-regular text-warning'>
                    Compte non activé
                  </span>
                )}
              </TD>

              <TDLink
                href={`/mes-jeunes/${beneficiaire.id}`}
                label={getRowLabel(beneficiaire)}
                className='!p-2 row-span-2 h-full flex items-center justify-center layout_m:row-span-1'
              />
            </TR>
          )
        )}
      </tbody>
    </>
  )
}
