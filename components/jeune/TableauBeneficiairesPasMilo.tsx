import React, { useEffect, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  BeneficiaireAvecInfosComplementaires,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { toRelativeDateTime } from 'utils/date'

interface TableauBeneficiairesPasMiloProps {
  beneficiaires: BeneficiaireAvecInfosComplementaires[]
  page: number
  total: number
}

export default function TableauBeneficiairesPasMilo({
  beneficiaires,
  page,
  total,
}: TableauBeneficiairesPasMiloProps) {
  const [beneficiairesAffiches, setBeneficiairesAffiches] = useState<
    BeneficiaireAvecInfosComplementaires[]
  >([])

  const messagesColumn = 'Messages non lus par le béneficiaire'
  const derniereActiviteColumn = 'Dernière activité'

  useEffect(() => {
    setBeneficiairesAffiches(beneficiaires.slice(10 * (page - 1), 10 * page))
  }, [beneficiaires, page])

  useMatomo('Mes jeunes', total > 0)

  return (
    <>
      <thead className='sr-only'>
        <TR isHeader={true}>
          <TH>Bénéficiaire</TH>
          <TH>{messagesColumn}</TH>
          <TH>{derniereActiviteColumn}</TH>
          <TH>Voir le détail</TH>
        </TR>
      </thead>

      <tbody className='grid grid-cols-[repeat(3,auto)] layout-m:grid-cols-[repeat(4,auto)] gap-y-2'>
        {beneficiairesAffiches.map(
          (beneficiaire: BeneficiaireAvecInfosComplementaires) => (
            <TR
              key={beneficiaire.id}
              className='grid grid-cols-subgrid grid-rows-[repeat(2,auto)] layout-m:grid-rows-[auto] col-span-full items-center'
            >
              <TD
                isBold
                className='relative h-full p-2! rounded-tl-base! rounded-bl-none! after:content-none after:absolute after:right-0 after:top-4 after:bottom-4 after:border-l-2 after:border-grey-500 layout-m:after:content-[""] layout-m:rounded-l-base!'
              >
                {beneficiaire.isReaffectationTemporaire && (
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
                {getNomBeneficiaireComplet(beneficiaire)}
              </TD>

              <TD className='h-full p-2!'>
                <div
                  className='text-s-regular text-grey-800'
                  aria-hidden={true}
                >
                  {messagesColumn}
                </div>
                <span className='text-m-bold'>
                  {beneficiaire.messagesNonLus}
                </span>
              </TD>

              <TD className='h-full p-2! row-start-2 col-span-2 flex flex-row justify-start items-baseline gap-4 rounded-bl-base layout-m:row-start-1 layout-m:col-start-3 layout-m:col-span-1 layout-m:rounded-none layout-m:flex-col layout-m:gap-0 layout-m:justify-center layout-m:pt-0'>
                {beneficiaire.lastActivity && (
                  <>
                    <span
                      className='text-xs-regular text-grey-800'
                      aria-hidden={true}
                    >
                      {derniereActiviteColumn}
                    </span>
                    <span className='text-s-regular'>
                      {toRelativeDateTime(beneficiaire.lastActivity)}
                    </span>
                  </>
                )}
                {!beneficiaire.lastActivity && (
                  <span className='text-s-regular text-warning'>
                    Compte non activé
                  </span>
                )}
              </TD>

              <TDLink
                href={`/mes-jeunes/${beneficiaire.id}`}
                labelPrefix='Accéder à la fiche de'
                className='p-2! row-span-2 h-full flex items-center justify-center layout-m:row-span-1'
              />
            </TR>
          )
        )}
      </tbody>
    </>
  )
}
