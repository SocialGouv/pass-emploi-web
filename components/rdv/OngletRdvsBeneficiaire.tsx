import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { Conseiller, estPoleEmploi } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'

interface OngletRdvsBeneficiaireProps {
  rdvs: EvenementListItem[]
  beneficiaire: BaseJeune
  conseiller: Conseiller
  erreurSessions: boolean
}

export default function OngletRdvsBeneficiaire({
  rdvs,
  beneficiaire,
  conseiller,
  erreurSessions,
}: OngletRdvsBeneficiaireProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  return (
    <>
      {estPoleEmploi(conseiller) && (
        <IntegrationPoleEmploi label='convocations' />
      )}

      {!estPoleEmploi(conseiller) && (
        <>
          {erreurSessions && (
            <FailureAlert label='Impossible de récupérer les sessions' />
          )}
          <TableauRdvsBeneficiaire
            rdvs={rdvs}
            idConseiller={conseiller.id}
            beneficiaire={beneficiaire}
            additionalColumn='Modalité'
          />
          <Link
            href={`${pathPrefix}/${beneficiaire.id}/rendez-vous-passes`}
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
