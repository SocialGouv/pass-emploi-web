import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface OngletRdvsBeneficiaireProps {
  rdvs: EvenementListItem[]
  beneficiaire: IdentiteBeneficiaire
  erreurSessions?: boolean
}

export default function OngletRdvsBeneficiaire({
  rdvs,
  beneficiaire,
  erreurSessions,
}: OngletRdvsBeneficiaireProps) {
  const [conseiller] = useConseiller()
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
        className='flex justify-end items-center text-content-color underline hover:text-primary hover:fill-primary mt-3'
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
