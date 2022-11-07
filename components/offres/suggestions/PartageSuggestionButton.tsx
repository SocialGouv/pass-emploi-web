import React from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TypeOffre } from 'interfaces/offre'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

interface PartageSuggestionButtonProps {
  typeOffre?: TypeOffre
  suggestionOffreEmploi: SearchOffresEmploiQuery
}

export default function PartageSuggestionButton({
  typeOffre,
  suggestionOffreEmploi,
}: PartageSuggestionButtonProps) {
  function suggestionEstPartageable() {
    return (
      typeOffre === TypeOffre.EMPLOI &&
      suggestionOffreEmploi.motsCles &&
      (suggestionOffreEmploi.commune || suggestionOffreEmploi.departement)
    )
  }

  function getPartagerSuggestionUrl(): string {
    const localite =
      suggestionOffreEmploi.commune ?? suggestionOffreEmploi.departement!
    const url = '/offres/partage-critere'
      .concat(`?type=${typeOffre}`)
      .concat(`&titre=${suggestionOffreEmploi.motsCles} - ${localite.libelle}`)
      .concat(`&motsCles=${suggestionOffreEmploi.motsCles}`)
      .concat(`&typeLocalite=${localite.type}`)
      .concat(`&labelLocalite=${localite.libelle}`)
      .concat(`&codeLocalite=${localite.code}`)
    return encodeURI(url)
  }

  return (
    <>
      {suggestionEstPartageable() && (
        <div className='flex justify-end items-center my-8'>
          <p className='mr-4'>
            Suggérer ces critères de recherche à vos bénéficiaires
          </p>
          <ButtonLink
            href={getPartagerSuggestionUrl()}
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
        </div>
      )}
    </>
  )
}
