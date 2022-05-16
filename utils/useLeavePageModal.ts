import Router from 'next/router'
import { useCallback, useEffect } from 'react'

export function useLeavePageModal(
  enabled: boolean | (() => boolean),
  openModal: () => void
) {
  useBeforeUnload(enabled)

  useEffect(() => {
    function handler() {
      if (typeof enabled === 'function' ? enabled() : enabled) {
        openModal()
        throw new Error('Navigation annulée pour confirmation')
      }
    }

    Router.events.on('beforeHistoryChange', handler)

    return () => {
      Router.events.off('beforeHistoryChange', handler)
    }
  }, [enabled, openModal])
}

function useBeforeUnload(enabled: boolean | (() => boolean)) {
  const handler = useCallback(
    (event: BeforeUnloadEvent) => {
      if (typeof enabled === 'function' ? !enabled() : !enabled) {
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
