import { DateTime } from 'luxon'
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { InputError } from '../ui/Form/InputError'
import ResettableTextInput from '../ui/Form/ResettableTextInput'

import EmptyState from 'components/EmptyState'
import { AnimationCollectiveRow } from 'components/rdv/AnimationCollectiveRow'
import FiltresStatutAnimationsCollectives from 'components/rdv/FiltresStatutAnimationsCollectives'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
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
  minCaracteres?: number
  setTrackingTitle: (title: string) => void
  initialTracking: string
}

export default function OngletAgendaEtablissement({
  recupererAnimationsCollectives,
  recupererSessionsMilo,
  trackNavigation,
  periodeIndex,
  changerPeriode,
  setTrackingTitle,
  initialTracking,
}: OngletAgendaEtablissementProps) {
  const [conseiller] = useConseiller()
  const [evenements, setEvenements] = useState<AnimationCollective[]>()

  const filtresRef = useRef<HTMLButtonElement>(null)
  const [filtres, setFiltres] = useState<StatutAnimationCollective[]>([])
  const [evenementsFiltres, setEvenementsFiltres] =
    useState<AnimationCollective[]>()

  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [labelPeriode, setLabelPeriode] = useState<string>()
  const [failed, setFailed] = useState<boolean>(false)
  const [query, setQuery] = useState<string>('')
  const [error, setError] = useState<string>()

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

  const onSearch = useCallback(
    (query: string) => {
      if (evenementsFiltres) {
        const querySplit = query.toLowerCase().split(/-|\s/)

        if (query) {
          const filtererResultat = evenementsFiltres.filter((evenement) => {
            const titre = evenement.titre.replace(/’/i, "'").toLowerCase()

            return querySplit.some((item) => titre.includes(item))
          })

          evenementsFiltres.forEach((event, index) => {
            console.log(`Event ${index} - Titre: ${event.titre}`)
          })

          setEvenementsFiltres(filtererResultat)

          if (filtererResultat.length > 0) {
            setTrackingTitle('Clic sur Rechercher - Recherche avec résultats')
          } else {
            setTrackingTitle('Clic sur Rechercher - Recherche sans résultats')
          }
        } else {
          setEvenementsFiltres(evenementsFiltres)
          setTrackingTitle(initialTracking)
        }
      }
    },
    [evenementsFiltres, setTrackingTitle, initialTracking]
  )

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!query.trim()) {
      setError('Please enter a search query.')
      return
    }

    setError('')
    onSearch(query)
  }

  const onReset = () => {
    setQuery('')
    setEvenementsFiltres([])
  }

  useEffect(() => {
    if (evenements) filtrerEvenements(evenements)
  }, [evenements, filtres])

  return (
    <>
      <div className='mb-12'>
        <form role='search' onSubmit={onSubmit} className='grow max-w-[75%]'>
          <label
            htmlFor='rechercher-beneficiaires'
            className='text-base-medium text-content_color'
          >
            Rechercher un atelier ou une information collective
          </label>
          {error && (
            <InputError id='rechercher-beneficiaires--error'>
              {error}
            </InputError>
          )}
          <div className='flex mt-3'>
            <ResettableTextInput
              id='rechercher-beneficiaires'
              className='flex-1 border border-solid border-grey_700 rounded-l-base border-r-0 text-base-medium text-primary_darken'
              onChange={(value: string) => setQuery(value)}
              onReset={onReset}
              value={query}
            />

            <button
              className='flex p-3 items-center text-base-bold text-primary border border-primary rounded-r-base hover:bg-primary_lighten'
              type='submit'
            >
              <IconComponent
                name={IconName.Search}
                focusable={false}
                aria-hidden={true}
                className='w-6 h-6 fill-[currentColor]'
              />
              <span className='ml-1 sr-only layout_s:not-sr-only'>
                Rechercher
              </span>
            </button>
          </div>
        </form>
      </div>
      <nav className='flex justify-between items-end'>
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
            text:
              'Liste des animations collectives de mon établissement ' +
              labelPeriode,
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

          <tbody className='grid auto-rows-auto grid-cols-[repeat(3,auto)] layout_base:grid-cols-[repeat(5,auto)] gap-y-2'>
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
