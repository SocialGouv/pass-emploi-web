import React, { useEffect, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TypeOffre } from 'interfaces/offre'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'

interface PartageRechercheButtonProps {
  primary?: boolean
  typeOffre?: TypeOffre
  suggestionOffreEmploi: SearchOffresEmploiQuery
  suggestionImmersion: SearchImmersionsQuery
  suggestionServiceCivique: SearchServicesCiviquesQuery
}

export default function PartageRechercheButton({
  primary,
  typeOffre,
  suggestionOffreEmploi,
  suggestionImmersion,
  suggestionServiceCivique,
}: PartageRechercheButtonProps) {
  const [errorMessage, setErrorMessage] = useState<boolean>()

  function laRechercheEstPartageable(): boolean {
    switch (typeOffre!) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return laRechercheOffreEmploiEstPartageable()
      case TypeOffre.IMMERSION:
        return laRechercheImmersionEstPartageable()
      case TypeOffre.SERVICE_CIVIQUE:
        return laRechercheServiceCiviqueEstPartageable()
    }
  }

  function laRechercheOffreEmploiEstPartageable(): boolean {
    return Boolean(
      suggestionOffreEmploi.motsCles &&
        (suggestionOffreEmploi.commune || suggestionOffreEmploi.departement)
    )
  }

  function laRechercheImmersionEstPartageable(): boolean {
    return Boolean(
      suggestionImmersion.metier?.value && suggestionImmersion.commune?.value
    )
  }

  function laRechercheServiceCiviqueEstPartageable(): boolean {
    return Boolean(suggestionServiceCivique.commune)
  }

  function getPartageRechercheUrl(): string {
    switch (typeOffre!) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return getPartageRechercheOffreEmploiUrl()
      case TypeOffre.IMMERSION:
        return getPartageRechercheImmersionUrl()
      case TypeOffre.SERVICE_CIVIQUE:
        return getPartageRechercheServiceCiviqueUrl()
    }
  }

  function getPartageRechercheOffreEmploiUrl(): string {
    const localite =
      suggestionOffreEmploi.commune ?? suggestionOffreEmploi.departement!
    const url = '/offres/partage-recherche'
      .concat(`?type=${typeOffre}`)
      .concat(`&titre=${suggestionOffreEmploi.motsCles} - ${localite.libelle}`)
      .concat(`&motsCles=${suggestionOffreEmploi.motsCles}`)
      .concat(`&typeLocalite=${localite.type}`)
      .concat(`&labelLocalite=${localite.libelle}`)
      .concat(`&codeLocalite=${localite.code}`)
    return encodeURI(url)
  }

  function getPartageRechercheImmersionUrl(): string {
    const url = '/offres/partage-recherche'
      .concat(`?type=${typeOffre}`)
      .concat(
        `&titre=${suggestionImmersion.metier.value!.libelle} - ${
          suggestionImmersion.commune.value!.libelle
        }`
      )
      .concat(`&labelMetier=${suggestionImmersion.metier.value!.libelle}`)
      .concat(`&codeMetier=${suggestionImmersion.metier.value!.code}`)
      .concat(`&labelLocalite=${suggestionImmersion.commune.value!.libelle}`)
      .concat(`&latitude=${suggestionImmersion.commune.value!.latitude}`)
      .concat(`&longitude=${suggestionImmersion.commune.value!.longitude}`)
    return encodeURI(url)
  }

  function getPartageRechercheServiceCiviqueUrl(): string {
    const url = '/offres/partage-recherche'
      .concat(`?type=${typeOffre}`)
      .concat(`&titre=${suggestionServiceCivique.commune!.libelle}`)
      .concat(`&labelLocalite=${suggestionServiceCivique.commune!.libelle}`)
      .concat(`&latitude=${suggestionServiceCivique.commune!.latitude}`)
      .concat(`&longitude=${suggestionServiceCivique.commune!.longitude}`)
    return encodeURI(url)
  }

  function getLabelRechercheNonPartageable(): string {
    switch (typeOffre!) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return 'Pour suggérer des critères de recherche, vous devez saisir un mot clé et un lieu de travail.'
      case TypeOffre.IMMERSION:
        return 'Pour suggérer des critères de recherche, vous devez saisir un métier et une ville.'
      case TypeOffre.SERVICE_CIVIQUE:
        return 'Pour suggérer des critères de recherche, vous devez saisir une ville.'
    }
  }

  useEffect(() => {
    setErrorMessage(false)
  }, [suggestionOffreEmploi])

  return (
    <>
      {typeOffre && (
        <>
          <div
            className={`
              flex mt-4 gap-4 ${errorMessage ? 'items-start' : 'items-center'}
            `}
          >
            <p>Suggérer ces critères de recherche à vos bénéficiaires</p>
            {errorMessage && (
              <p className='text-warning'>
                {getLabelRechercheNonPartageable()}
              </p>
            )}
            {laRechercheEstPartageable() && (
              <ButtonLink
                href={getPartageRechercheUrl()}
                style={primary ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY}
              >
                <IconComponent
                  name={IconName.Share}
                  className='w-4 h-4 mr-3'
                  focusable={false}
                  aria-hidden={true}
                />
                Partager les critères
                <span className='sr-only'> de recherche</span>
              </ButtonLink>
            )}
            {!laRechercheEstPartageable() && (
              <Button
                style={primary ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY}
                onClick={() => setErrorMessage(true)}
              >
                <IconComponent
                  name={IconName.Share}
                  className='w-4 h-4 mr-3'
                  focusable={false}
                  aria-hidden={true}
                />
                Partager les critères
                <span className='sr-only'> de recherche</span>
              </Button>
            )}
          </div>
        </>
      )}
    </>
  )
}
