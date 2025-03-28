import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import EmptyState from 'components/EmptyState'
import FiltresStatutAnimationsCollectives, {
  FiltresHandles,
} from 'components/rdv/FiltresStatutAnimationsCollectives'
import TableauAnimationsCollectives from 'components/rdv/TableauAnimationsCollectives'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type OngletAgendaMissionLocaleProps = {
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

export default function OngletAgendaMissionLocale({
  recupererAnimationsCollectives,
  recupererSessionsMilo,
  trackNavigation,
  periodeIndex,
  changerPeriode,
}: OngletAgendaMissionLocaleProps) {
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
  const [failed, setFailed] = useState<string>()

  async function modifierPeriode(
    nouvellePeriode: { index: number; debut: DateTime; fin: DateTime },
    opts: { label: string; shouldFocus: boolean }
  ) {
    await chargerEvenementsPeriode(nouvellePeriode.debut, nouvellePeriode.fin)
    setLabelPeriode(opts.label)
    changerPeriode(nouvellePeriode.index)
    setShouldFocus(opts.shouldFocus)
  }

  async function chargerEvenementsPeriode(
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    setFailed(undefined)
    setEvenementsAffiches(undefined)
    let erreurs

    let animationsCollectives: AnimationCollective[] = []
    try {
      animationsCollectives = await recupererAnimationsCollectives(
        dateDebut,
        dateFin
      )
    } catch {
      erreurs = 'animationsCollectives'
    }

    let sessions: AnimationCollective[] = []
    if (peutAccederAuxSessions(conseiller)) {
      try {
        sessions = await recupererSessionsMilo(dateDebut, dateFin)
      } catch {
        erreurs = erreurs ? 'all' : 'sessions'
      }
    }

    setFailed(erreurs)
    setEvenements(
      [...animationsCollectives, ...sessions].sort(
        (ac1, ac2) => ac1.date.toMillis() - ac2.date.toMillis()
      )
    )
    setPeriode({ debut: dateDebut, fin: dateFin })
  }

  function filtrerEtChercherEvenements(): AnimationCollective[] {
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
    filtrerEtChercherEvenements()
  }, [evenements])

  useEffect(() => {
    if (!evenements) return
    const evenementsFiltres = filtrerEtChercherEvenements()

    if (evenementsFiltres.length) filtresRef.current!.focus()
  }, [filtres])

  useEffect(() => {
    if (!evenements) return
    filtrerEtChercherEvenements()

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
          jourReference={DateTime.now().weekday}
          periodeInitiale={periodeIndex}
          onNouvellePeriode={modifierPeriode}
          trackNavigation={trackNavigation}
        />

        <FiltresStatutAnimationsCollectives
          ref={filtresRef}
          onFiltres={setFiltres}
          defaultValue={filtres}
        />
      </nav>

      {!evenementsAffiches && !failed && (
        <EmptyState
          illustrationName={IllustrationName.Sablier}
          titre='L’affichage de l’agenda de votre Mission Locale peut prendre quelques instants.'
          sousTitre='Veuillez patienter pendant le chargement des informations.'
        />
      )}

      <ErreursRecuperation
        failed={failed}
        shouldFocus={shouldFocus}
        onRetry={() => chargerEvenementsPeriode(periode!.debut, periode!.fin)}
      />

      {evenementsAffiches &&
        evenementsAffiches?.length === 0 &&
        evenements?.length === 0 && (
          <div className='flex flex-col justify-center items-center'>
            <EmptyState
              shouldFocus={shouldFocus}
              illustrationName={IllustrationName.Checklist}
              titre='Il n’y a pas d’animation collective sur cette période dans votre Mission Locale.'
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
        <TableauAnimationsCollectives
          ref={tableRef}
          animationsCollectives={evenementsAffiches}
          labelPeriode={labelPeriode!}
          withRecherche={Boolean(recherche)}
        />
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
        className='text-base-medium text-content-color'
      >
        Rechercher un atelier ou une information collective
      </label>
      <div className='flex mt-3'>
        <ResettableTextInput
          id='rechercher-agenda'
          className='flex-1 border border-solid border-grey-700 rounded-l-base border-r-0 text-base-medium text-primary-darken'
          onChange={setRecherche}
          onReset={onReset}
          value={recherche}
        />

        <button
          className='flex p-3 items-center text-base-bold text-primary border border-primary rounded-r-base hover:bg-primary-lighten'
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

function ErreursRecuperation({
  failed,
  shouldFocus,
  onRetry,
}: {
  failed: string | undefined
  shouldFocus: boolean
  onRetry: () => Promise<void>
}) {
  const labelContactSupport =
    'Si le problème persiste, contactez notre support.'

  switch (failed) {
    case 'animationsCollectives':
      return (
        <FailureAlert
          label='La récupération des animations collectives de votre Mission Locale a échoué.'
          className='mt-4'
        >
          <p className='pl-8'>{labelContactSupport}</p>
        </FailureAlert>
      )

    case 'sessions':
      return (
        <FailureAlert
          label='La récupération des sessions de votre Mission Locale depuis i-milo a échoué.'
          className='mt-4'
        >
          <p className='pl-8'>{labelContactSupport}</p>
        </FailureAlert>
      )

    case 'all':
      return (
        <EmptyState
          shouldFocus={shouldFocus}
          illustrationName={IllustrationName.Maintenance}
          titre='L’affichage de l’agenda de votre Mission Locale a échoué.'
          sousTitre={labelContactSupport}
          bouton={{
            onClick: onRetry,
            label: 'Réessayer',
          }}
        />
      )

    default:
      return null
  }
}
