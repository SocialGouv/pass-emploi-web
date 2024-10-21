import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import ResettableTextInput from '../ui/Form/ResettableTextInput'

import EmptyState from 'components/EmptyState'
import { AnimationCollectiveRow } from 'components/rdv/AnimationCollectiveRow'
import FiltresStatutAnimationsCollectives from 'components/rdv/FiltresStatutAnimationsCollectives'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { estMilo, peutAccederAuxSessions } from 'interfaces/conseiller'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

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
  const tableRef = useRef<HTMLTableElement>(null)

  const [filtres, setFiltres] = useState<StatutAnimationCollective[]>([])
  const [recherche, setRecherche] = useState<string>('')
  const [evenementsAffiches, setEvenementsAffiches] =
    useState<AnimationCollective[]>()

  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [labelPeriode, setLabelPeriode] = useState<string>()
  const [periodeFailed, setPeriodeFailed] = useState<boolean>(false)

  async function modifierFiltres(nouveauxFiltres: StatutAnimationCollective[]) {
    setFiltres(nouveauxFiltres)
    filtresRef.current!.focus()
  }

  async function modifierPeriode(
    nouvellePeriodeIndex: number,
    dateDebut: DateTime,
    dateFin: DateTime,
    label: string
  ) {
    await chargerEvenementsPeriode(dateDebut, dateFin)
    setLabelPeriode(label)
    changerPeriode(nouvellePeriodeIndex)
  }

  async function chargerEvenementsPeriode(
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    setPeriodeFailed(false)
    setEvenementsAffiches(undefined)

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
      setPeriodeFailed(true)
    } finally {
      setPeriode({ debut: dateDebut, fin: dateFin })
    }
  }

  useEffect(() => {
    if (!evenements) return
    setEvenementsAffiches(undefined)
    let evenementsFiltres = evenements

    if (filtres.length)
      evenementsFiltres = evenementsFiltres.filter(
        (ac) => ac.statut && filtres.includes(ac.statut)
      )

    if (recherche) {
      const querySplit = recherche.toLowerCase().split(/-|\s/)
      evenementsFiltres = evenementsFiltres.filter((evenement) => {
        const titre = evenement.titre.replace(/’/i, "'").toLowerCase()
        return querySplit.some((item) => titre.includes(item))
      })
    }

    setEvenementsAffiches(evenementsFiltres)
  }, [evenements, filtres, recherche])

  useEffect(() => {
    tableRef.current?.focus()
  }, [recherche])

  return (
    <>
      <RechercheAgendaForm onSearch={setRecherche} />

      <nav className='flex flex-wrap justify-between items-end'>
        <SelecteurPeriode
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

      {!evenementsAffiches && !periodeFailed && (
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

      {!evenementsAffiches && periodeFailed && (
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

      {evenementsAffiches?.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            shouldFocus={filtres.length > 0}
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

      {evenementsAffiches && evenementsAffiches.length > 0 && (
        <table className='w-full mt-6' tabIndex={-1} ref={tableRef}>
          <caption className='mb-6 text-left text-m-bold text-primary'>
            {evenementsAffiches.length}{' '}
            {evenementsAffiches.length === 1 &&
              (recherche ? 'résultat' : 'atelier ou information collective')}
            {evenementsAffiches.length > 1 &&
              (recherche
                ? 'résultats'
                : 'ateliers ou informations collectives')}
            <span className='sr-only'> {labelPeriode}</span>
          </caption>

          <thead className='sr-only'>
            <tr>
              <th scope='col'>Horaires et durée</th>
              <th scope='col'>Titre, type et visibilité</th>
              <th scope='col'>Inscrits</th>
              <th scope='col'>Statut</th>
              <th scope='col'>Voir le détail</th>
            </tr>
          </thead>

          <tbody className='grid auto-rows-auto grid-cols-[repeat(3,auto)] layout_base:grid-cols-[repeat(5,auto)] gap-y-2'>
            {evenementsAffiches.map((evenement) => (
              <AnimationCollectiveRow
                key={evenement.id}
                animationCollective={evenement}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

function RechercheAgendaForm({
  onSearch,
}: {
  onSearch: (query: string) => void
}) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [recherche, setRecherche] = useState<string>('')

  function rechercherDansAgenda(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSearch(recherche)

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Agenda',
      action: 'Recheche',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  function onReset() {
    setRecherche('')
    onSearch('')
  }

  return (
    <form role='search' onSubmit={rechercherDansAgenda} className='mb-6'>
      <label
        htmlFor='rechercher-agenda'
        className='text-base-medium text-content_color'
      >
        Rechercher un atelier ou une information collective
      </label>
      <div className='flex mt-3'>
        <ResettableTextInput
          id='rechercher-agenda'
          className='flex-1 border border-solid border-grey_700 rounded-l-base border-r-0 text-base-medium text-primary_darken'
          onChange={setRecherche}
          onReset={onReset}
          value={recherche}
        />

        <button
          className='flex p-3 items-center text-base-bold text-primary border border-primary rounded-r-base hover:bg-primary_lighten'
          type='submit'
        >
          <IconComponent
            name={IconName.Search}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 fill-current'
          />
          <span className='ml-1 sr-only'>Rechercher</span>
        </button>
      </div>
    </form>
  )
}
