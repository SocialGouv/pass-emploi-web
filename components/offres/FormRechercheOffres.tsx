import React, { FormEvent, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import RechercheImmersionsPrincipale from 'components/offres/RechercheImmersionsPrincipale'
import RechercheImmersionsSecondaire from 'components/offres/RechercheImmersionsSecondaire'
import RechercheOffresEmploiPrincipale from 'components/offres/RechercheOffresEmploiPrincipale'
import RechercheOffresEmploiSecondaire from 'components/offres/RechercheOffresEmploiSecondaire'
import RechercheServicesCiviquesPrincipale from 'components/offres/RechercheServicesCiviquesPrincipale'
import RechercheServicesCiviquesSecondaire from 'components/offres/RechercheServicesCiviquesSecondaire'
import Button from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { estPoleEmploiBRSA } from 'interfaces/conseiller'
import { TypeOffre } from 'interfaces/offre'
import { Commune, Localite, Metier } from 'interfaces/referentiel'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'
import { FormValues } from 'types/form'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useSessionStorage } from 'utils/hooks/useSessionStorage'

type FormRechercheOffresProps = {
  hasResults: boolean
  fetchMetiers: (search: string) => Promise<Metier[]>
  fetchCommunes: (search: string) => Promise<Commune[]>
  fetchCommunesEtDepartements: (search: string) => Promise<Localite[]>
  stateTypeOffre: [TypeOffre | undefined, (type: TypeOffre) => void]
  stateQueryOffresEmploi: [
    FormValues<SearchOffresEmploiQuery>,
    (query: FormValues<SearchOffresEmploiQuery>) => void
  ]
  stateQueryServicesCiviques: [
    FormValues<SearchServicesCiviquesQuery>,
    (query: FormValues<SearchServicesCiviquesQuery>) => void
  ]
  stateQueryImmersions: [
    FormValues<SearchImmersionsQuery>,
    (query: FormValues<SearchImmersionsQuery>) => void
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
  const [conseiller] = useConseiller()
  const [showForm, setShowForm] = useState<boolean>(true)
  const [showFilters, setShowFilters] = useState<boolean>(true)
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false)
  const [countCriteres, setCountCriteres] = useSessionStorage<number>(
    'recherche-offres--nb-criteres',
    0
  )

  const [typeOffre, setTypeOffre] = stateTypeOffre
  const [queryOffresEmploi, setQueryOffresEmploi] = stateQueryOffresEmploi
  const [queryServicesCiviques, setQueryServicesCiviques] =
    stateQueryServicesCiviques
  const [queryImmersions, setQueryImmersions] = stateQueryImmersions

  function formIsInvalid(): boolean {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return queryOffresEmploi.hasError
      case TypeOffre.SERVICE_CIVIQUE:
        return queryServicesCiviques.hasError
      case TypeOffre.IMMERSION:
        return queryImmersions.hasError
      default:
        return true
    }
  }

  async function rechercherPremierePage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (hasResults) return
    if (formIsInvalid()) return
    if (!typeOffre) return

    onNouvelleRecherche()
  }

  return (
    <form
      onSubmit={rechercherPremierePage}
      className={hasResults ? 'bg-primary_lighten p-6 mb-10 rounded-base' : ''}
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
            <RadioBox
              isSelected={typeOffre === TypeOffre.EMPLOI}
              onChange={() => setTypeOffre(TypeOffre.EMPLOI)}
              name='type-offre'
              id='type-offre--emploi'
              label='Offre d’emploi'
            />

            {!estPoleEmploiBRSA(conseiller) && (
              <>
                <RadioBox
                  isSelected={typeOffre === TypeOffre.ALTERNANCE}
                  onChange={() => setTypeOffre(TypeOffre.ALTERNANCE)}
                  name='type-offre'
                  id='type-offre--alternance'
                  label='Alternance'
                />

                <RadioBox
                  isSelected={typeOffre === TypeOffre.SERVICE_CIVIQUE}
                  onChange={() => setTypeOffre(TypeOffre.SERVICE_CIVIQUE)}
                  name='type-offre'
                  id='type-offre--service-civique'
                  label='Service civique'
                />
              </>
            )}
            <RadioBox
              isSelected={typeOffre === TypeOffre.IMMERSION}
              onChange={() => setTypeOffre(TypeOffre.IMMERSION)}
              name='type-offre'
              id='type-offre--immersion'
              label='Immersion'
            />
          </div>
        </Etape>

        {getRechercheMain()}

        {typeOffre && showFilters && (
          <>
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

            {showMoreFilters && getRechercheSecondary()}
          </>
        )}

        {typeOffre && (
          <>
            <div className='mt-5 mb-4 text-center'>
              [{countCriteres}] filtre{countCriteres > 1 && 's'} sélectionné
              {countCriteres > 1 && 's'}
            </div>

            <Button
              type='submit'
              className='mx-auto'
              disabled={formIsInvalid() || hasResults}
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
        return (
          <RechercheOffresEmploiPrincipale
            key='recherche-offres--emploi--principale'
            recupererCommunesEtDepartements={fetchCommunesEtDepartements}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
            onRechercheParIdOffre={(value) => {
              setShowFilters(!value)
            }}
          />
        )
      case TypeOffre.ALTERNANCE:
        return (
          <RechercheOffresEmploiPrincipale
            key='recherche-offres--alternance--principale'
            recupererCommunesEtDepartements={fetchCommunesEtDepartements}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
            onRechercheParIdOffre={(value) => {
              setShowFilters(!value)
            }}
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
        return (
          <RechercheOffresEmploiSecondaire
            key='recherche-offres--emploi--secondaire'
            alternanceOnly={false}
            onCriteresChange={setCountCriteres}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.ALTERNANCE:
        return (
          <RechercheOffresEmploiSecondaire
            key='recherche-offres--alternance--secondaire'
            alternanceOnly={true}
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
