import React, { useEffect, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TypeOffre } from 'interfaces/offre'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

interface PartageRechercheButtonProps {
  typeOffre?: TypeOffre
  suggestionOffreEmploi: SearchOffresEmploiQuery
}

export default function PartageRechercheButton({
  typeOffre,
  suggestionOffreEmploi,
}: PartageRechercheButtonProps) {
  const [errorMessage, setErrorMessage] = useState<boolean>()

  function laRechercheEstPartageable() {
    return (
      suggestionOffreEmploi.motsCles &&
      (suggestionOffreEmploi.commune || suggestionOffreEmploi.departement)
    )
  }

  function getPartageRechercheUrl(): string {
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

  useEffect(() => {
    setErrorMessage(false)
  }, [suggestionOffreEmploi])

  return (
    <>
      {typeOffre === TypeOffre.EMPLOI && (
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
                  Pour suggérer des critères de recherche, vous devez saisir un
                  mot clé et un lieu de travail
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
