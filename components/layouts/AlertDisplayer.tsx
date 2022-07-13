import { useRouter } from 'next/router'
import React from 'react'

import SuccessMessage from 'components/ui/SuccessMessage'
import { Alerts, QueryParams, QueryValues } from 'referentiel/queryParams'
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

  return (
    <div className={hideOnLargeScreen ? 'layout_s:hidden' : ''}>
      {Alerts.map((alert) => (
        <>
          {router.query[alert.nom] === QueryValues.succes && (
            <SuccessMessage
              label={alert.message}
              onAcknowledge={() => closeSuccessAlert(alert.nom)}
            />
          )}
        </>
      ))}
    </div>
  )
}
