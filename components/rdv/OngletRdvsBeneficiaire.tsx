import Link from 'next/link'
import React from 'react'

import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import TableauRdv from 'components/rdv/TableauRdv'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Conseiller, isPoleEmploi } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'

interface OngletRdvsBeneficiaireProps {
  rdvs: EvenementListItem[]
  beneficiaire: BaseJeune
  conseiller: Conseiller
}

export function OngletRdvsBeneficiaire({
  rdvs,
  beneficiaire,
  conseiller,
}: OngletRdvsBeneficiaireProps) {
  return (
    <>
      {isPoleEmploi(conseiller) && (
        <IntegrationPoleEmploi label='convocations' />
      )}

      {!isPoleEmploi(conseiller) && (
        <>
          <TableauRdv
            rdvs={rdvs}
            idConseiller={conseiller.id}
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
      )}
    </>
  )
}
