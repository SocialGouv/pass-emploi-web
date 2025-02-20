import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import EmptyState from 'components/EmptyState'
import { AnimationCollectiveRow } from 'components/rdv/AnimationCollectiveRow'
import FiltresStatutAnimationsCollectives, {
  FiltresHandles,
} from 'components/rdv/FiltresStatutAnimationsCollectives'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
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

  const filtresRef = useRef<FiltresHandles>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const [filtres, setFiltres] = useState<StatutAnimationCollective[]>([])
  const [recherche, setRecherche] = useState<string>('')
  const [evenementsAffiches, setEvenementsAffiches] =
    useState<AnimationCollective[]>()
  const [shouldFocus, setShouldFocus] = useState<boolean>(false)

  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [labelPeriode, setLabelPeriode] = useState<string>()
  const [periodeFailed, setPeriodeFailed] = useState<boolean>(false)

  async function modifierPeriode(
    nouvellePeriode: { index: number; dateDebut: DateTime; dateFin: DateTime },
    opts: { label: string; shouldFocus: boolean }
  ) {
    await chargerEvenementsPeriode(
      nouvellePeriode.dateDebut,
      nouvellePeriode.dateFin
    )
    setLabelPeriode(opts.label)
    changerPeriode(nouvellePeriode.index)
    setShouldFocus(opts.shouldFocus)
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
        [...evenementsRecuperes].sort(
          (ac1, ac2) => ac1.date.toMillis() - ac2.date.toMillis()
        )
      )
    } catch {
      setPeriodeFailed(true)
    } finally {
      setPeriode({ debut: dateDebut, fin: dateFin })
    }
  }

  function filtrerEvenements(): AnimationCollective[] {
    setEvenementsAffiches(undefined)
    let evenementsFiltres = evenements!

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
    return evenementsFiltres
  }

  useEffect(() => {
    if (!evenements) return
    filtrerEvenements()
  }, [evenements])

  useEffect(() => {
    if (!evenements) return
    const evenementsFiltres = filtrerEvenements()

    if (evenementsFiltres.length) filtresRef.current!.focus()
  }, [filtres])

  useEffect(() => {
    if (!evenements) return
    filtrerEvenements()

    tableRef.current?.focus()
  }, [recherche])

  useEffect(() => {
    if (shouldFocus) tableRef.current?.focus()
  }, [evenementsAffiches])

  return (
    <>
      <RechercheAgendaForm onSearch={setRecherche} />

      <nav className='flex justify-between items-center'>
        <SelecteurPeriode
          onNouvellePeriode={modifierPeriode}
          periodeCourante={periodeIndex}
          trackNavigation={trackNavigation}
        />

        <FiltresStatutAnimationsCollectives
          ref={filtresRef}
          onFiltres={setFiltres}
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
          shouldFocus={shouldFocus}
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

      {evenementsAffiches &&
        evenementsAffiches?.length === 0 &&
        evenements?.length === 0 && (
          <div className='flex flex-col justify-center items-center'>
            <EmptyState
              shouldFocus={shouldFocus}
              illustrationName={IllustrationName.Checklist}
              titre='Il n’y a pas d’animation collective sur cette période dans votre établissement.'
              sousTitre={undefined}
              lien={{
                href: '/mes-jeunes/edition-rdv?type=ac',
                label: 'Créer une animation collective',
                iconName: IconName.Add,
              }}
            />
          </div>
        )}
      {evenementsAffiches?.length === 0 &&
        evenements &&
        evenements?.length > 0 && (
          <EmptyState
            shouldFocus={shouldFocus}
            illustrationName={IllustrationName.Search}
            titre='Aucun événement ne correspond à votre recherche sur la période sélectionnée.'
            sousTitre='Vous pouvez essayer de modifier vos critères de recherche, ajuster les filtres appliqués, ou changer la période.'
          />
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
