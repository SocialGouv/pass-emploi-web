import React, { useEffect, useState } from 'react'

import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SpinningLoader from 'components/ui/SpinningLoader'
import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface OngletRdvsBeneficiaireProps {
  beneficiaire: IdentiteBeneficiaire
  getRdvs: () => Promise<EvenementListItem[]>
  erreurSessions?: boolean
}

export default function OngletRdvsBeneficiaire({
  beneficiaire,
  getRdvs,
  erreurSessions,
}: OngletRdvsBeneficiaireProps) {
  const [conseiller] = useConseiller()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rdvs, setRdvs] = useState<EvenementListItem[]>()

  useEffect(() => {
    setIsLoading(true)

    getRdvs()
      .then(setRdvs)
      .finally(() => {
        setIsLoading(false)
      })
  }, [getRdvs])

  return (
    <>
      {!rdvs && <SpinningLoader />}

      {erreurSessions && (
        <FailureAlert label='Impossible de récupérer les sessions' />
      )}

      {rdvs && rdvs.length > 0 && (
        <TableauRdvsBeneficiaire
          rdvs={rdvs}
          idConseiller={conseiller.id}
          isLoading={isLoading}
          beneficiaire={beneficiaire}
          additionalColumn='Modalité'
        />
      )}
    </>
  )
}
