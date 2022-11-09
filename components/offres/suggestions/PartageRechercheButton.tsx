import React, { useEffect, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TypeOffre } from 'interfaces/offre'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

interface PartageRechercheButtonProps {
  typeOffre?: TypeOffre
  suggestionOffreEmploi: SearchOffresEmploiQuery
  suggestionImmersion: SearchImmersionsQuery
}

export default function PartageRechercheButton({
  typeOffre,
  suggestionOffreEmploi,
  suggestionImmersion,
}: PartageRechercheButtonProps) {
  const [errorMessage, setErrorMessage] = useState<boolean>()

  function laRechercheEstPartageable(): boolean {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        return laRechercheOffreEmploiEstPartageable()
      case TypeOffre.IMMERSION:
        return laRechercheImmersionEstPartageable()
      default:
        return false
    }
  }

  function laRechercheOffreEmploiEstPartageable(): boolean {
    return Boolean(
      suggestionOffreEmploi.motsCles &&
        (suggestionOffreEmploi.commune || suggestionOffreEmploi.departement)
    )
  }

  function laRechercheImmersionEstPartageable(): boolean {
    return Boolean(suggestionImmersion.metier && suggestionImmersion.commune)
  }

  function afficheLeBoutonDePartage(): boolean {
    return typeOffre === TypeOffre.EMPLOI || typeOffre === TypeOffre.IMMERSION
  }

  function getPartageRechercheUrl(): string {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        return getPartageRechercheOffreEmploiUrl()
      case TypeOffre.IMMERSION:
        return getPartageRechercheImmersionUrl()
      default:
        return ''
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
        `&titre=${suggestionImmersion.metier.libelle} - ${suggestionImmersion.commune.libelle}`
      )
      .concat(`&labelMetier=${suggestionImmersion.metier.libelle}`)
      .concat(`&codeMetier=${suggestionImmersion.metier.code}`)
      .concat(`&labelLocalite=${suggestionImmersion.commune.libelle}`)
      .concat(`&latitude=${suggestionImmersion.commune.latitude}`)
      .concat(`&longitude=${suggestionImmersion.commune.longitude}`)
    return encodeURI(url)
  }

  function getLabelRechercheNonPartageable(): string {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        return 'Pour suggérer des critères de recherche, vous devez saisir un mot clé et un lieu de travail'
      case TypeOffre.IMMERSION:
        return 'Pour suggérer des critères de recherche, vous devez saisir un métier et une ville'
      default:
        return ''
    }
  }

  useEffect(() => {
    setErrorMessage(false)
  }, [suggestionOffreEmploi])

  return (
    <>
      {afficheLeBoutonDePartage() && (
        <>
          <div
            className={
              'flex justify-end my-8 gap-4 ' +
              (errorMessage ? 'items-start' : 'items-center')
            }
          >
            <div className='max-w-[40%]'>
              <p>Suggérer ces critères de recherche à vos bénéficiaires</p>
              {errorMessage && (
                <p className='text-warning'>
                  {getLabelRechercheNonPartageable()}
                </p>
              )}
            </div>
            {laRechercheEstPartageable() && (
              <ButtonLink
                href={getPartageRechercheUrl()}
                style={ButtonStyle.SECONDARY}
              >
                <IconComponent
                  name={IconName.Partage}
                  className='w-4 h-4 mr-3'
                  focusable={false}
                  aria-hidden={true}
                />
                Partager <span className='sr-only'>critères de recherche</span>
              </ButtonLink>
            )}
            {!laRechercheEstPartageable() && (
              <Button
                style={ButtonStyle.SECONDARY}
                onClick={() => setErrorMessage(true)}
              >
                <IconComponent
                  name={IconName.Partage}
                  className='w-4 h-4 mr-3'
                  focusable={false}
                  aria-hidden={true}
                />
                Partager <span className='sr-only'>critères de recherche</span>
              </Button>
            )}
          </div>
        </>
      )}
    </>
  )
}
