import { useRouter } from 'next/router'
import React, { Fragment } from 'react'

import SuccessMessage from 'components/ui/SuccessMessage'
import { Alerts, QueryValues } from 'referentiel/queryParams'
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
        <Fragment key={`alerte-${alert.nom}`}>
          {router.query[alert.nom] === QueryValues.succes && (
            <SuccessMessage
              label={alert.message}
              onAcknowledge={() => closeSuccessAlert(alert.nom)}
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}
