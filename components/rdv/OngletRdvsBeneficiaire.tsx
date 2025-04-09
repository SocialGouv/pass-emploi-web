import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SpinningLoader from 'components/ui/SpinningLoader'
import { DetailBeneficiaire } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface OngletRdvsBeneficiaireProps {
  beneficiaire: DetailBeneficiaire
  getRdvs: () => Promise<EvenementListItem[]>
  shouldFocus: boolean
  erreurSessions?: boolean
}

export default function OngletRdvsBeneficiaire({
  beneficiaire,
  getRdvs,
  shouldFocus,
  erreurSessions,
}: OngletRdvsBeneficiaireProps) {
  const [conseiller] = useConseiller()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rdvs, setRdvs] = useState<EvenementListItem[]>()

  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)

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
      {isLoading && <SpinningLoader alert={true} />}

      {erreurSessions && (
        <FailureAlert label='Impossible de récupérer les sessions' />
      )}

      {!isLoading && rdvs && rdvs.length === 0 && !lectureSeule && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            shouldFocus={shouldFocus}
            illustrationName={IllustrationName.Checklist}
            titre={`Aucun rendez-vous ou atelier pour ${beneficiaire.prenom} ${beneficiaire.nom}`}
            lien={{
              href: `/mes-jeunes/edition-rdv?idJeune=${beneficiaire.id}`,
              label: 'Créer un rendez-vous',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {!isLoading && rdvs && rdvs.length === 0 && lectureSeule && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            shouldFocus={shouldFocus}
            illustrationName={IllustrationName.Checklist}
            titre={`Aucun rendez-vous ou atelier pour ${beneficiaire.prenom} ${beneficiaire.nom}`}
            lien={{
              href: `/mes-jeunes/edition-rdv?idJeune=${beneficiaire.id}`,
              label: 'Créer un rendez-vous',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {!isLoading && rdvs && rdvs.length > 0 && (
        <TableauRdvsBeneficiaire
          rdvs={rdvs}
          idConseiller={conseiller.id}
          beneficiaire={beneficiaire}
          shouldFocus={shouldFocus}
        />
      )}
    </>
  )
}
