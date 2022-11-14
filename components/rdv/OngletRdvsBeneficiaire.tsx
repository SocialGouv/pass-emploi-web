import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from '../ui/IconComponent'

import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import TableauRdv from 'components/rdv/TableauRdv'
import { RdvListItem } from 'interfaces/rdv'

interface OngletRdvsProps {
  rdvs: RdvListItem[]
  poleEmploi: boolean
  idConseiller: string
  idJeune: string
}

export function OngletRdvsBeneficiaire({
  idConseiller,
  idJeune,
  poleEmploi,
  rdvs,
}: OngletRdvsProps) {
  return (
    <>
      {!poleEmploi ? (
        <>
          <TableauRdv
            rdvs={rdvs}
            idConseiller={idConseiller}
            withNameJeune={false}
          />
          <Link href={`/mes-jeunes/${idJeune}/rendez-vous-passes`}>
            <a className='flex justify-end items-center text-content_color underline hover:text-primary hover:fill-primary mt-3'>
              Voir les événements passés
              <IconComponent
                name={IconName.ChevronRight}
                className='w-4 h-5 fill-[inherit]'
                aria-hidden={true}
                focusable={false}
              />
            </a>
          </Link>
        </>
      ) : (
        <IntegrationPoleEmploi label='convocations' />
      )}
    </>
  )
}
