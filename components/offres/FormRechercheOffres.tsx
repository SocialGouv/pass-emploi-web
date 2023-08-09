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
  showForm: boolean
  fetchMetiers: (search: string) => Promise<Metier[]>
  fetchCommunes: (search: string) => Promise<Commune[]>
  fetchCommunesEtDepartements: (search: string) => Promise<Localite[]>
  stateTypeOffre: [TypeOffre | undefined, (type: TypeOffre) => void]
  stateQueryOffresEmploi: [
    FormValues<SearchOffresEmploiQuery>,
    (query: FormValues<SearchOffresEmploiQuery>) => void,
  ]
  stateQueryServicesCiviques: [
    FormValues<SearchServicesCiviquesQuery>,
    (query: FormValues<SearchServicesCiviquesQuery>) => void,
  ]
  stateQueryImmersions: [
    FormValues<SearchImmersionsQuery>,
    (query: FormValues<SearchImmersionsQuery>) => void,
  ]
  onNouvelleRecherche: () => void
}
export default function FormRechercheOffres({
  fetchMetiers,
  fetchCommunes,
  fetchCommunesEtDepartements,
  hasResults,
  onNouvelleRecherche,
  showForm,
  stateQueryOffresEmploi,
  stateQueryServicesCiviques,
  stateQueryImmersions,
  stateTypeOffre,
}: FormRechercheOffresProps) {
  const [conseiller] = useConseiller()
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

  const [offreTitre, setOffreTitre] = useState<string | undefined>()
  const [motsCles, setMotsCles] = useState<string | undefined>()
  const [offreLieu, setOffreLieu] = useState<string | undefined>()

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

  function handleChangeTypeOffre(type: TypeOffre) {
    setTypeOffre(type)
    setOffreLieu(undefined)
    setMotsCles(undefined)

    switch (type) {
      case TypeOffre.ALTERNANCE:
        setOffreTitre('Alternance')
        break
      case TypeOffre.SERVICE_CIVIQUE:
        setOffreTitre('Service Civique')
        break
      case TypeOffre.IMMERSION:
        setOffreTitre('Immersion')
        break
      case TypeOffre.EMPLOI:
      default:
        setOffreTitre('Offre d’emploi')
        break
    }
  }

  function handleQueryOffreEmploi(query: FormValues<SearchOffresEmploiQuery>) {
    setQueryOffresEmploi(query)
    setOffreLieu(query.commune?.libelle)
    setMotsCles(query.motsCles)
  }

  function handleQueryImmersion(query: FormValues<SearchImmersionsQuery>) {
    setQueryImmersions(query)
    setOffreLieu(query.commune?.libelle)
    setMotsCles(query.metier?.libelle)
  }

  function handleQueryServiceCivique(
    query: FormValues<SearchServicesCiviquesQuery>
  ) {
    setQueryServicesCiviques(query)
    setOffreLieu(query.commune?.libelle)
    setMotsCles(query.domaine)
  }

  return (
    <form onSubmit={rechercherPremierePage}>
      <div className={!showForm ? 'hidden' : ''} aria-hidden={!showForm}>
        <Etape numero={1} titre='Sélectionner un type d’offre'>
          <div className='flex flex-wrap'>
            <RadioBox
              isSelected={typeOffre === TypeOffre.EMPLOI}
              onChange={() => handleChangeTypeOffre(TypeOffre.EMPLOI)}
              name='type-offre'
              id='type-offre--emploi'
              label='Offre d’emploi'
            />

            {!estPoleEmploiBRSA(conseiller) && (
              <>
                <RadioBox
                  isSelected={typeOffre === TypeOffre.ALTERNANCE}
                  onChange={() => handleChangeTypeOffre(TypeOffre.ALTERNANCE)}
                  name='type-offre'
                  id='type-offre--alternance'
                  label='Alternance'
                />

                <RadioBox
                  isSelected={typeOffre === TypeOffre.SERVICE_CIVIQUE}
                  onChange={() =>
                    handleChangeTypeOffre(TypeOffre.SERVICE_CIVIQUE)
                  }
                  name='type-offre'
                  id='type-offre--service-civique'
                  label='Service civique'
                />
              </>
            )}
            <RadioBox
              isSelected={typeOffre === TypeOffre.IMMERSION}
              onChange={() => handleChangeTypeOffre(TypeOffre.IMMERSION)}
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
      {!showForm && (
        <div className='flex mt-4 gap-2'>
          {Boolean(offreTitre && offreTitre.length > 0) && (
            <p className='bg-blanc px-2 py-1 text-primary rounded-base'>
              {offreTitre}
            </p>
          )}
          {Boolean(motsCles && motsCles.length > 0) && (
            <p className='bg-blanc px-2 py-1 text-primary rounded-base'>
              {motsCles}
            </p>
          )}
          {Boolean(offreLieu && offreLieu.length > 0) && (
            <p className='bg-blanc px-2 py-1 text-primary rounded-base'>
              {offreLieu}
            </p>
          )}
        </div>
      )}
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
            onQueryUpdate={handleQueryOffreEmploi}
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
            onQueryUpdate={handleQueryOffreEmploi}
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
            onQueryUpdate={handleQueryServiceCivique}
          />
        )
      case TypeOffre.IMMERSION:
        return (
          <RechercheImmersionsPrincipale
            recupererMetiers={fetchMetiers}
            recupererCommunes={fetchCommunes}
            query={queryImmersions}
            onQueryUpdate={handleQueryImmersion}
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
            onQueryUpdate={handleQueryOffreEmploi}
          />
        )
      case TypeOffre.ALTERNANCE:
        return (
          <RechercheOffresEmploiSecondaire
            key='recherche-offres--alternance--secondaire'
            alternanceOnly={true}
            onCriteresChange={setCountCriteres}
            query={queryOffresEmploi}
            onQueryUpdate={handleQueryOffreEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesSecondaire
            onCriteresChange={setCountCriteres}
            query={queryServicesCiviques}
            onQueryUpdate={handleQueryServiceCivique}
          />
        )
      case TypeOffre.IMMERSION:
        return (
          <RechercheImmersionsSecondaire
            onCriteresChange={setCountCriteres}
            query={queryImmersions}
            onQueryUpdate={handleQueryImmersion}
          />
        )
      case undefined:
        return null
    }
  }
}
