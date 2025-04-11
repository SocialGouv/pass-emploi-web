import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauRdvsBeneficiaire from 'components/rdv/TableauRdvsBeneficiaire'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import SpinningLoader from 'components/ui/SpinningLoader'
import { DetailBeneficiaire } from 'interfaces/beneficiaire'
import {
  estConseillerReferent,
  peutAccederAuxSessions,
} from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { getRendezVousJeune } from 'services/evenements.service'
import { getSessionsMiloBeneficiaire } from 'services/sessions.service'
import { Periode } from 'types/dates'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { compareDates } from 'utils/date'

interface OngletRdvsBeneficiaireProps {
  beneficiaire: DetailBeneficiaire
  shouldFocus: boolean
  semaine: Periode
}

export default function OngletRdvsBeneficiaire({
  beneficiaire,
  shouldFocus,
  semaine,
}: OngletRdvsBeneficiaireProps) {
  const [conseiller] = useConseiller()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rdvsAAfficher, setRdvsAAfficher] = useState<EvenementListItem[]>()
  const [erreurSessions, setErreurSessions] = useState<boolean>(false)

  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)

  async function chargerRdvs(): Promise<EvenementListItem[]> {
    const rdvs = await getRendezVousJeune(
      conseiller.id,
      beneficiaire.id,
      semaine
    )

    let sessionsMilo: EvenementListItem[] = []
    if (
      peutAccederAuxSessions(conseiller) &&
      conseiller.structureMilo!.id === beneficiaire.structureMilo?.id
    ) {
      try {
        setErreurSessions(false)
        sessionsMilo = await getSessionsMiloBeneficiaire(
          beneficiaire.id,
          semaine
        )
      } catch {
        setErreurSessions(true)
      }
    }

    return trieParDateRdvsEtSessions(rdvs, sessionsMilo)
  }

  function trieParDateRdvsEtSessions(
    rdvs: EvenementListItem[],
    sessionsMilo: EvenementListItem[]
  ) {
    return [...rdvs]
      .concat(sessionsMilo)
      .sort((event1, event2) =>
        compareDates(
          DateTime.fromISO(event1.date),
          DateTime.fromISO(event2.date)
        )
      )
  }

  useEffect(() => {
    setIsLoading(true)

    chargerRdvs()
      .then(setRdvsAAfficher)
      .finally(() => {
        setIsLoading(false)
      })
  }, [semaine])

  return (
    <>
      {isLoading && <SpinningLoader alert={true} />}

      {erreurSessions && (
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
