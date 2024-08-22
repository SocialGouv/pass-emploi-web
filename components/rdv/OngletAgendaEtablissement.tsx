import { DateTime } from 'luxon'
import React, { useState } from 'react'

import EmptyState from 'components/EmptyState'
import { AnimationCollectiveRow } from 'components/rdv/AnimationCollectiveRow'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import Table from 'components/ui/Table/Table'
import { estMilo, peutAccederAuxSessions } from 'interfaces/conseiller'
import { AnimationCollective } from 'interfaces/evenement'
import { useConseiller } from 'utils/conseiller/conseillerContext'

type OngletAgendaEtablissementProps = {
  recupererAnimationsCollectives: (
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<AnimationCollective[]>
  recupererSessionsMilo: (
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<AnimationCollective[]>
  trackNavigation: (append?: string) => void
  periodeIndex: number
  changerPeriode: (index: number) => void
}

export default function OngletAgendaEtablissement({
  recupererAnimationsCollectives,
  recupererSessionsMilo,
  trackNavigation,
  periodeIndex,
  changerPeriode,
}: OngletAgendaEtablissementProps) {
  const [conseiller] = useConseiller()
  const [evenements, setEvenements] = useState<AnimationCollective[]>()

  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [failed, setFailed] = useState<boolean>(false)

  async function chargerNouvellePeriode(
    nouvellePeriodeIndex: number,
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    await chargerEvenementsPeriode(dateDebut, dateFin)
    changerPeriode(nouvellePeriodeIndex)
  }

  async function chargerEvenementsPeriode(
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    setFailed(false)

    try {
      const animationsCollectives = await recupererAnimationsCollectives(
        dateDebut,
        dateFin
      )

      if (peutAccederAuxSessions(conseiller)) {
        const sessions = await recupererSessionsMilo(dateDebut, dateFin)
        setEvenements([...sessions, ...animationsCollectives])
      } else {
        setEvenements([...animationsCollectives])
      }
    } catch (e) {
      setFailed(true)
    } finally {
      setPeriode({ debut: dateDebut, fin: dateFin })
    }
  }

  return (
    <>
      <SelecteurPeriode
        nombreJours={7}
        onNouvellePeriode={chargerNouvellePeriode}
        periodeCourante={periodeIndex}
        trackNavigation={trackNavigation}
      />

      {!evenements && !failed && (
        <EmptyState
          illustrationName={IllustrationName.Sablier}
          titre={`
            L’affichage de l’agenda de votre ${
              estMilo(conseiller) ? 'Mission Locale' : 'établissement'
            } peut prendre quelques instants.
          `}
          sousTitre='Veuillez patienter pendant le chargement des informations.'
        />
      )}

      {!evenements && failed && (
        <EmptyState
          illustrationName={IllustrationName.Maintenance}
          titre={`
            L’affichage de l’agenda de votre ${
              estMilo(conseiller) ? 'Mission Locale' : 'établissement'
            } a échoué.
          `}
          sousTitre='Si le problème persiste, contactez notre support.'
          bouton={{
            onClick: () =>
              chargerEvenementsPeriode(periode!.debut, periode!.fin),
            label: 'Réessayer',
          }}
        />
      )}

      {evenements?.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre='Il n’y a pas d’animation collective sur cette période dans votre établissement.'
            lien={{
              href: '/mes-jeunes/edition-rdv?type=ac',
              label: 'Créer une animation collective',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {evenements && evenements.length > 0 && (
        <Table
          caption={{
            text: 'Liste des animations collectives de mon établissement',
          }}
        >
          <thead className='sr-only'>
            <tr>
              <th scope='col'>Horaires et durée</th>
              <th scope='col'>Titre, type et visibilité</th>
              <th scope='col'>Inscrits</th>
              <th scope='col'>Statut </th>
              <th scope='col'>Voir le détail</th>
            </tr>
          </thead>

          <tbody>
            {evenements.map((evenement) => (
              <AnimationCollectiveRow
                key={evenement.id}
                animationCollective={evenement}
              />
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
