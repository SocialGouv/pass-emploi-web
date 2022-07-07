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

  return (
    <div className={hideOnLargeScreen ? 'layout_s:hidden' : ''}>
      {router.query[QueryParams.envoiMessage] === QueryValues.succes && (
        <SuccessMessage
          label='Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires'
          onAcknowledge={closeMessageGroupeEnvoiSuccess}
        />
      )}
    </div>
  )
}
