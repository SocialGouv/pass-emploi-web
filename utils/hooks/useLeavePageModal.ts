import Router from 'next/router'
import { useCallback, useEffect } from 'react'

export function useLeavePageModal(
  enabled: boolean,
  openModal: (destination: string) => void
) {
  useBeforeUnload(enabled)

  useEffect(() => {
    function handler(destination: string) {
      if (enabled) {
        openModal(destination)
        throw new Error('Navigation annulée pour confirmation')
      }
    }

    Router.events.on('beforeHistoryChange', handler)

    return () => {
      Router.events.off('beforeHistoryChange', handler)
    }
  }, [enabled, openModal])
}

function useBeforeUnload(enabled: boolean) {
  const handler = useCallback(
    (event: BeforeUnloadEvent) => {
      if (!enabled) {
        return
      }

      const message =
        'Vous allez quitter la page. Toutes les données seront perdues.'
      event.preventDefault()
      event.returnValue = message
      return message
    },
    [enabled]
  )

  useEffect(() => {
    window.addEventListener('beforeunload', handler)

    return () => window.removeEventListener('beforeunload', handler)
  }, [enabled, handler])
}
