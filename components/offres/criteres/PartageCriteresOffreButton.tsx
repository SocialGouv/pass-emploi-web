import React from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TypeOffre } from 'interfaces/offre'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { encodeBase64 } from 'utils/encoding/base64-enconding'

interface PartageCriteresOffreButtonProps {
  typeOffre?: TypeOffre
  criteres: SearchOffresEmploiQuery
}

export default function PartageCriteresOffreButton({
  typeOffre,
  criteres,
}: PartageCriteresOffreButtonProps) {
  function getPartagerCriteresDeRechercheUrl() {
    const criteresToString = JSON.stringify(criteres)
    const criteresEncoded = encodeBase64(criteresToString)
    return `/offres/partage-critere?type=${typeOffre}&criteres=${criteresEncoded}`
  }

  return (
    <>
      {typeOffre === TypeOffre.EMPLOI &&
        (criteres.commune || criteres.departement) && (
          <div className='flex justify-end items-center my-8'>
            <p className='mr-4'>
              Suggérer ces critères de recherche à vos bénéficiaires
            </p>
            <ButtonLink
              href={getPartagerCriteresDeRechercheUrl()}
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
