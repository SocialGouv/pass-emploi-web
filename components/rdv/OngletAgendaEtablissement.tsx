import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import EmptyState from 'components/EmptyState'
import { AnimationCollectiveRow } from 'components/rdv/AnimationCollectiveRow'
import FiltresStatutAnimationsCollectives from 'components/rdv/FiltresStatutAnimationsCollectives'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import Table from 'components/ui/Table/Table'
import { estMilo, peutAccederAuxSessions } from 'interfaces/conseiller'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
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

  const filtresRef = useRef<HTMLButtonElement>(null)
  const [filtres, setFiltres] = useState<StatutAnimationCollective[]>([])
  const [evenementsFiltres, setEvenementsFiltres] =
    useState<AnimationCollective[]>()

  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [failed, setFailed] = useState<boolean>(false)

  async function modifierFiltres(nouveauxFiltres: StatutAnimationCollective[]) {
    setFiltres(nouveauxFiltres)
    filtresRef.current!.focus()
  }

  async function modifierPeriode(
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
    setEvenementsFiltres(undefined)

    try {
      const animationsCollectives = await recupererAnimationsCollectives(
        dateDebut,
        dateFin
      )
      const evenementsRecuperes = [...animationsCollectives]

      if (peutAccederAuxSessions(conseiller)) {
        const sessions = await recupererSessionsMilo(dateDebut, dateFin)
        evenementsRecuperes.push(...sessions)
      }

      setEvenements(
        evenementsRecuperes.toSorted(
          (ac1, ac2) => ac1.date.toMillis() - ac2.date.toMillis()
        )
      )
    } catch (e) {
      setFailed(true)
    } finally {
      setPeriode({ debut: dateDebut, fin: dateFin })
    }
  }

  function filtrerEvenements(aFiltrer: AnimationCollective[]) {
    setEvenementsFiltres(undefined)
    if (!filtres.length) setEvenementsFiltres(aFiltrer)
    else {
      const acFiltrees = aFiltrer.filter(
        (ac) => ac.statut && filtres.includes(ac.statut)
      )
      setEvenementsFiltres(acFiltrees)
    }
  }

  useEffect(() => {
    if (evenements) filtrerEvenements(evenements)
  }, [evenements, filtres])

  return (
    <>
      <nav className='flex justify-between items-end'>
        <SelecteurPeriode
          nombreJours={7}
          onNouvellePeriode={modifierPeriode}
          periodeCourante={periodeIndex}
          trackNavigation={trackNavigation}
        />

        <FiltresStatutAnimationsCollectives
          ref={filtresRef}
          onFiltres={modifierFiltres}
          defaultValue={filtres}
        />
      </nav>

      {!evenementsFiltres && !failed && (
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

      {!evenementsFiltres && failed && (
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

      {evenementsFiltres?.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre={
              filtres.length === 0
                ? 'Il n’y a pas d’animation collective sur cette période dans votre établissement.'
                : 'Aucune animation collective ne correspond au(x) filtre(s) sélectionné(s) sur cette période.'
            }
            lien={{
              href: '/mes-jeunes/edition-rdv?type=ac',
              label: 'Créer une animation collective',
              iconName: IconName.Add,
            }}
          />

          {evenements!.length > 0 && (
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={() => modifierFiltres([])}
              className='m-auto mt-8'
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      {evenementsFiltres && evenementsFiltres.length > 0 && (
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

          <tbody className='grid auto-rows-fr grid-cols-[repeat(3,auto)] layout_m:grid-cols-[auto_1fr_repeat(3,auto)] gap-y-2'>
            {evenementsFiltres.map((evenement) => (
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
