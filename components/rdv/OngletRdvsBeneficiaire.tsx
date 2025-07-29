import React from 'react'

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
  shouldFocus: boolean
  isLoading: boolean
  rdvsAAfficher?: EvenementListItem[]
  erreurRecuperationSessions: boolean
}

export default function OngletRdvsBeneficiaire({
  beneficiaire,
  shouldFocus,
  isLoading,
  rdvsAAfficher,
  erreurRecuperationSessions,
}: OngletRdvsBeneficiaireProps) {
  const [conseiller] = useConseiller()
  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)

  return (
    <>
      {isLoading && <SpinningLoader alert={true} />}

      {erreurRecuperationSessions && (
        <FailureAlert label='Impossible de récupérer les sessions' />
      )}

      {!isLoading &&
        rdvsAAfficher &&
        rdvsAAfficher.length === 0 &&
        !lectureSeule && (
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

      {!isLoading &&
        rdvsAAfficher &&
        rdvsAAfficher.length === 0 &&
        lectureSeule && (
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

      {!isLoading && rdvsAAfficher && rdvsAAfficher.length > 0 && (
        <TableauRdvsBeneficiaire
          rdvs={rdvsAAfficher}
          idConseiller={conseiller.id}
          beneficiaire={beneficiaire}
          shouldFocus={shouldFocus}
        />
      )}
    </>
  )
}
