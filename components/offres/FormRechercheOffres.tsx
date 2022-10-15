import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

import RadioButton from 'components/action/RadioButton'
import RechercheOffresEmploiMain from 'components/offres/RechercheOffresEmploiMain'
import RechercheOffresEmploiSecondary from 'components/offres/RechercheOffresEmploiSecondary'
import RechercheServicesCiviquesMain from 'components/offres/RechercheServicesCiviquesMain'
import RechercheServicesCiviquesSecondary from 'components/offres/RechercheServicesCiviquesSecondary'
import Button from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TypeOffre } from 'interfaces/offre'
import { Commune, Localite } from 'interfaces/referentiel'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'

type WithHasError<T> = T & { hasError: boolean }
type FormRechercheOffresProps = {
  isSearching: boolean
  hasResults: boolean
  fetchCommunes: (search: string) => Promise<Commune[]>
  fetchCommunesEtDepartements: (search: string) => Promise<Localite[]>
  stateTypeOffre: [
    TypeOffre | undefined,
    Dispatch<SetStateAction<TypeOffre | undefined>>
  ]
  stateQueryOffresEmploi: [
    WithHasError<SearchOffresEmploiQuery>,
    Dispatch<SetStateAction<WithHasError<SearchOffresEmploiQuery>>>
  ]
  stateQueryServicesCiviques: [
    WithHasError<SearchServicesCiviquesQuery>,
    Dispatch<SetStateAction<WithHasError<SearchServicesCiviquesQuery>>>
  ]
  onNouvelleRecherche: () => void
}
export default function FormRechercheOffres(props: FormRechercheOffresProps) {
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false)
  const [countCriteres, setCountCriteres] = useState<number>(0)

  const [typeOffre, setTypeOffre] = props.stateTypeOffre
  const [queryOffresEmploi, setQueryOffresEmploi] = props.stateQueryOffresEmploi
  const [queryServiceCivique, setQueryServiceCivique] =
    props.stateQueryServicesCiviques
  const formIsInvalid =
    queryOffresEmploi.hasError || queryServiceCivique.hasError

  async function rechercherPremierePage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (props.hasResults) return
    if (props.isSearching) return
    if (formIsInvalid) return
    if (!typeOffre) return

    props.onNouvelleRecherche()
  }

  useEffect(() => {
    setQueryOffresEmploi({ hasError: false })
    setQueryServiceCivique({ hasError: false })
  }, [typeOffre])

  return (
    <form
      onSubmit={rechercherPremierePage}
      className={
        props.hasResults || props.isSearching
          ? 'bg-primary_lighten p-6 mb-10 rounded-small'
          : ''
      }
    >
      <Etape numero={1} titre='Sélectionner un type d’offre'>
        <div className='flex flex-wrap'>
          <RadioButton
            isSelected={typeOffre === TypeOffre.EMPLOI}
            onChange={() => setTypeOffre(TypeOffre.EMPLOI)}
            name='type-offre'
            id='type-offre--emploi'
            label='Offre d’emploi'
          />
          <RadioButton
            isSelected={typeOffre === TypeOffre.SERVICE_CIVIQUE}
            onChange={() => setTypeOffre(TypeOffre.SERVICE_CIVIQUE)}
            name='type-offre'
            id='type-offre--service-civique'
            label='Service civique'
          />
        </div>
      </Etape>

      {getRechercheMain()}

      {typeOffre && (
        <div className='flex justify-end mb-6'>
          <button
            type='button'
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className='mr-12'
          >
            Voir {showMoreFilters ? 'moins' : 'plus'} de critères
            <IconComponent
              name={showMoreFilters ? IconName.ChevronUp : IconName.ChevronDown}
              className='h-4 w-4 fill-primary inline ml-2'
              aria-hidden={true}
              focusable={false}
            ></IconComponent>
          </button>
        </div>
      )}

      {showMoreFilters && getRechercheSecondary()}

      {typeOffre && (
        <>
          <div className='mt-5 mb-4 text-center'>
            [{countCriteres}] critère{countCriteres > 1 && 's'} sélectionné
            {countCriteres > 1 && 's'}
          </div>

          <Button
            type='submit'
            className='mx-auto'
            disabled={formIsInvalid || props.isSearching || props.hasResults}
          >
            <IconComponent
              name={IconName.Search}
              focusable={false}
              aria-hidden={true}
              className='w-4 h-4 mr-2'
            />
            Rechercher
          </Button>
        </>
      )}
    </form>
  )

  function getRechercheMain(): JSX.Element | null {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        return (
          <RechercheOffresEmploiMain
            fetchCommunesEtDepartements={props.fetchCommunesEtDepartements}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesMain
            fetchCommunes={props.fetchCommunes}
            query={queryServiceCivique}
            onQueryUpdate={setQueryServiceCivique}
          />
        )
      default:
        return null
    }
  }

  function getRechercheSecondary(): JSX.Element | null {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        return (
          <RechercheOffresEmploiSecondary
            onCriteresChange={setCountCriteres}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesSecondary
            onCriteresChange={setCountCriteres}
            query={queryServiceCivique}
            onQueryUpdate={setQueryServiceCivique}
          />
        )
      default:
        return null
    }
  }
}
