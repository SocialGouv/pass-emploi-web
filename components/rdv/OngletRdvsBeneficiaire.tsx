import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'

interface OngletRdvsBeneficiaireProps {
  rdvs: EvenementListItem[]
  beneficiaire: BaseBeneficiaire
  conseiller: Conseiller
  erreurSessions?: boolean
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
  )
}
