import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

import RadioButton from 'components/action/RadioButton'
import RechercheImmersionsPrincipale from 'components/offres/RechercheImmersionsPrincipale'
import RechercheImmersionsSecondaire from 'components/offres/RechercheImmersionsSecondaire'
import RechercheOffresEmploiPrincipale from 'components/offres/RechercheOffresEmploiPrincipale'
import RechercheOffresEmploiSecondaire from 'components/offres/RechercheOffresEmploiSecondaire'
import RechercheServicesCiviquesPrincipale from 'components/offres/RechercheServicesCiviquesPrincipale'
import RechercheServicesCiviquesSecondaire from 'components/offres/RechercheServicesCiviquesSecondaire'
import Button from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TypeOffre } from 'interfaces/offre'
import { Commune, Localite, Metier } from 'interfaces/referentiel'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'
import { FormValues } from 'types/form'

type FormRechercheOffresProps = {
  hasResults: boolean
  fetchMetiers: (search: string) => Promise<Metier[]>
  fetchCommunes: (search: string) => Promise<Commune[]>
  fetchCommunesEtDepartements: (search: string) => Promise<Localite[]>
  stateTypeOffre: [
    TypeOffre | undefined,
    Dispatch<SetStateAction<TypeOffre | undefined>>
  ]
  stateQueryOffresEmploi: [
    FormValues<SearchOffresEmploiQuery>,
    Dispatch<SetStateAction<FormValues<SearchOffresEmploiQuery>>>
  ]
  stateQueryServicesCiviques: [
    FormValues<SearchServicesCiviquesQuery>,
    Dispatch<SetStateAction<FormValues<SearchServicesCiviquesQuery>>>
  ]
  stateQueryImmersions: [
    FormValues<SearchImmersionsQuery>,
    Dispatch<SetStateAction<FormValues<SearchImmersionsQuery>>>
  ]
  onNouvelleRecherche: () => void
}
export default function FormRechercheOffres({
  fetchMetiers,
  fetchCommunes,
  fetchCommunesEtDepartements,
  hasResults,
  onNouvelleRecherche,
  stateQueryOffresEmploi,
  stateQueryServicesCiviques,
  stateQueryImmersions,
  stateTypeOffre,
}: FormRechercheOffresProps) {
  const [showForm, setShowForm] = useState<boolean>(true)
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false)
  const [countCriteres, setCountCriteres] = useState<number>(0)

  const [typeOffre, setTypeOffre] = stateTypeOffre
  const [queryOffresEmploi, setQueryOffresEmploi] = stateQueryOffresEmploi
  const [queryServicesCiviques, setQueryServicesCiviques] =
    stateQueryServicesCiviques
  const [queryImmersions, setQueryImmersions] = stateQueryImmersions

  const formIsInvalid =
    queryOffresEmploi.hasError ||
    queryServicesCiviques.hasError ||
    queryImmersions.hasError

  async function rechercherPremierePage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (hasResults) return
    if (formIsInvalid) return
    if (!typeOffre) return

    onNouvelleRecherche()
  }

  useEffect(() => {
    setQueryOffresEmploi({ hasError: false })
    setQueryServicesCiviques({ hasError: false })
    setQueryImmersions({
      rayon: 10,
      hasError: typeOffre === TypeOffre.IMMERSION,
    })
  }, [typeOffre])

  return (
    <form
      onSubmit={rechercherPremierePage}
      className={hasResults ? 'bg-primary_lighten p-6 mb-10 rounded-small' : ''}
    >
      <div className={`flex justify-between ${showForm ? 'mb-5' : ''}`}>
        <h2 className='text-m-medium text-primary'>Ma recherche</h2>
        {hasResults && (
          <button type='button' onClick={() => setShowForm(!showForm)}>
            <IconComponent
              name={showForm ? IconName.ChevronUp : IconName.ChevronDown}
              title={`${showForm ? 'Cacher' : 'Voir'} les critères`}
              className='h-6 w-6 fill-primary'
              focusable={false}
            ></IconComponent>
            <span className='sr-only'>
              {showForm ? 'Cacher' : 'Voir'} les critères
            </span>
          </button>
        )}
      </div>

      <div className={!showForm ? 'hidden' : ''} aria-hidden={!showForm}>
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
              isSelected={typeOffre === TypeOffre.ALTERNANCE}
              onChange={() => setTypeOffre(TypeOffre.ALTERNANCE)}
              name='type-offre'
              id='type-offre--alternance'
              label='Alternance'
            />
            <RadioButton
              isSelected={typeOffre === TypeOffre.SERVICE_CIVIQUE}
              onChange={() => setTypeOffre(TypeOffre.SERVICE_CIVIQUE)}
              name='type-offre'
              id='type-offre--service-civique'
              label='Service civique'
            />
            <RadioButton
              isSelected={typeOffre === TypeOffre.IMMERSION}
              onChange={() => setTypeOffre(TypeOffre.IMMERSION)}
              name='type-offre'
              id='type-offre--immersion'
              label='Immersion'
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
                name={
                  showMoreFilters ? IconName.ChevronUp : IconName.ChevronDown
                }
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
              disabled={formIsInvalid || hasResults}
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
      </div>
    </form>
  )

  function getRechercheMain(): JSX.Element | null {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return (
          <RechercheOffresEmploiPrincipale
            recupererCommunesEtDepartements={fetchCommunesEtDepartements}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesPrincipale
            recupererCommunes={fetchCommunes}
            query={queryServicesCiviques}
            onQueryUpdate={setQueryServicesCiviques}
          />
        )
      case TypeOffre.IMMERSION:
        return (
          <RechercheImmersionsPrincipale
            recupererMetiers={fetchMetiers}
            recupererCommunes={fetchCommunes}
            query={queryImmersions}
            onQueryUpdate={setQueryImmersions}
          />
        )
      case undefined:
        return null
    }
  }

  function getRechercheSecondary(): JSX.Element | null {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return (
          <RechercheOffresEmploiSecondaire
            onCriteresChange={setCountCriteres}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesSecondaire
            onCriteresChange={setCountCriteres}
            query={queryServicesCiviques}
            onQueryUpdate={setQueryServicesCiviques}
          />
        )
      case TypeOffre.IMMERSION:
        return (
          <RechercheImmersionsSecondaire
            onCriteresChange={setCountCriteres}
            query={queryImmersions}
            onQueryUpdate={setQueryImmersions}
          />
        )
      case undefined:
        return null
    }
  }
}
