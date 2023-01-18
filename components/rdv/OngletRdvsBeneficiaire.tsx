import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from '../ui/IconComponent'

import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import TableauRdv from 'components/rdv/TableauRdv'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'

interface OngletRdvsBeneficiaireProps {
  rdvs: EvenementListItem[]
  beneficiaire: BaseJeune
  poleEmploi: boolean
  idConseiller: string
}

export function OngletRdvsBeneficiaire({
  idConseiller,
  beneficiaire,
  poleEmploi,
  rdvs,
}: OngletRdvsBeneficiaireProps) {
  return (
    <>
      {!poleEmploi ? (
        <>
          <TableauRdv
            rdvs={rdvs}
            idConseiller={idConseiller}
            beneficiaireUnique={beneficiaire}
            additionalColumns='Modalité'
          />
          <Link
            href={`/mes-jeunes/${beneficiaire.id}/rendez-vous-passes`}
            className='flex justify-end items-center text-content_color underline hover:text-primary hover:fill-primary mt-3'
          >
            Voir les événements passés
            <IconComponent
              name={IconName.ChevronRight}
              className='w-4 h-5 fill-[inherit]'
              aria-hidden={true}
              focusable={false}
            />
          </Link>
        </>
      ) : (
        <IntegrationPoleEmploi label='convocations' />
      )}
    </>
  )
}
