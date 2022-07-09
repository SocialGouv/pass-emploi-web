import { useRouter } from 'next/router'
import React from 'react'

import SuccessMessage from 'components/ui/SuccessMessage'
import { QueryParams, QueryValues } from 'referentiel/queryParams'
import { deleteQueryParams, parseUrl } from 'utils/urlParser'

interface AlertDisplayerProps {
  hideOnLargeScreen?: boolean
}

export default function AlertDisplayer({
  hideOnLargeScreen = false,
}: AlertDisplayerProps) {
  const router = useRouter()

  // TODO peut etre definir un autre type que string pour le queryParam
  async function closeSuccessAlert(queryParam: string): Promise<void> {
    const { pathname, query } = parseUrl(router.asPath)
    await router.push(
      {
        pathname,
        query: deleteQueryParams(query, [queryParam]),
      },
      undefined,
      { shallow: true }
    )
  }

  // TODO Alert gérer // a supprimer
  //envoiMessage
  //creationRdv
  //modificationRdv
  //suppressionRdv
  //creationAction
  //suppressionAction
  //recuperationBeneficiaire
  //suppressionBeneficiaire
  return (
    <div className={hideOnLargeScreen ? 'layout_s:hidden' : ''}>
      {router.query[QueryParams.envoiMessage] === QueryValues.succes && (
        <SuccessMessage
          label='Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires'
          onAcknowledge={() => closeSuccessAlert(QueryParams.envoiMessage)}
        />
      )}
      {router.query[QueryParams.creationRdv] === QueryValues.succes && (
        <SuccessMessage
          label='Le rendez-vous a bien été créé'
          onAcknowledge={() => closeSuccessAlert(QueryParams.creationRdv)}
        />
      )}
      {router.query[QueryParams.modificationRdv] === QueryValues.succes && (
        <SuccessMessage
          label='Le rendez-vous a bien été modifié'
          onAcknowledge={() => closeSuccessAlert(QueryParams.modificationRdv)}
        />
      )}
      {router.query[QueryParams.suppressionRdv] === QueryValues.succes && (
        <SuccessMessage
          label='Le rendez-vous a bien été supprimé'
          onAcknowledge={() => closeSuccessAlert(QueryParams.suppressionRdv)}
        />
      )}
      {router.query[QueryParams.creationAction] === QueryValues.succes && (
        <SuccessMessage
          label='L’action a bien été créée'
          onAcknowledge={() => closeSuccessAlert(QueryParams.creationAction)}
        />
      )}
      {router.query[QueryParams.recuperationBeneficiaires] ===
        QueryValues.succes && (
        <SuccessMessage
          label='Vous avez récupéré vos bénéficiaires avec succès'
          onAcknowledge={() =>
            closeSuccessAlert(QueryParams.recuperationBeneficiaires)
          }
        />
      )}
      {router.query[QueryParams.suppressionBeneficiaire] ===
        QueryValues.succes && (
        <SuccessMessage
          label='Le compte du bénéficiaire a bien été supprimé'
          onAcknowledge={() =>
            closeSuccessAlert(QueryParams.suppressionBeneficiaire)
          }
        />
      )}
    </div>
  )
}
