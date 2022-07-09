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

  async function closeMessageGroupeEnvoiSuccess(): Promise<void> {
    const { pathname, query } = parseUrl(router.asPath)
    await router.push(
      {
        pathname,
        query: deleteQueryParams(query, [QueryParams.envoiMessage]),
      },
      undefined,
      { shallow: true }
    )
  }

  async function closeCreationRdvSuccess(): Promise<void> {
    const { pathname, query } = parseUrl(router.asPath)
    await router.push(
      {
        pathname,
        query: deleteQueryParams(query, [QueryParams.creationRdv]),
      },
      undefined,
      { shallow: true }
    )
  }

  async function closeModificationRdvSuccess(): Promise<void> {
    const { pathname, query } = parseUrl(router.asPath)
    await router.push(
      {
        pathname,
        query: deleteQueryParams(query, [QueryParams.modificationRdv]),
      },
      undefined,
      { shallow: true }
    )
  }

  async function closeSuppressionRdvSuccess(): Promise<void> {
    const { pathname, query } = parseUrl(router.asPath)
    await router.push(
      {
        pathname,
        query: deleteQueryParams(query, [QueryParams.suppressionRdv]),
      },
      undefined,
      { shallow: true }
    )
  }

  async function closeCreationActionSuccess(): Promise<void> {
    const { pathname, query } = parseUrl(router.asPath)
    await router.push(
      {
        pathname,
        query: deleteQueryParams(query, [QueryParams.creationAction]),
      },
      undefined,
      { shallow: true }
    )
  }

  //envoiMessage
  //creationRdv
  //modificationRdv
  //suppressionRdv
  //creationAction
  return (
    <div className={hideOnLargeScreen ? 'layout_s:hidden' : ''}>
      {router.query[QueryParams.envoiMessage] === QueryValues.succes && (
        <SuccessMessage
          label='Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires'
          onAcknowledge={closeMessageGroupeEnvoiSuccess}
        />
      )}
      {router.query[QueryParams.creationRdv] === QueryValues.succes && (
        <SuccessMessage
          label='Le rendez-vous a bien été créé'
          onAcknowledge={closeCreationRdvSuccess}
        />
      )}
      {router.query[QueryParams.modificationRdv] === QueryValues.succes && (
        <SuccessMessage
          label='Le rendez-vous a bien été modifié'
          onAcknowledge={closeModificationRdvSuccess}
        />
      )}
      {router.query[QueryParams.suppressionRdv] === QueryValues.succes && (
        <SuccessMessage
          label='Le rendez-vous a bien été supprimé'
          onAcknowledge={closeSuppressionRdvSuccess}
        />
      )}
      {router.query[QueryParams.creationAction] === QueryValues.succes && (
        <SuccessMessage
          label='L’action a bien été créée'
          onAcknowledge={closeCreationActionSuccess}
        />
      )}
    </div>
  )
}
