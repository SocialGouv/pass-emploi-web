import React from 'react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
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
    </>
  )
}
