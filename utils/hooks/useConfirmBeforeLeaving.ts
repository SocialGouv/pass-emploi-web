import { useCallback, useEffect } from 'react'

export function useConfirmBeforeLeaving(enabled: boolean) {
  useBeforeUnload(enabled)

  // FIXME not possible with /app router
  // useEffect(() => {
  //   function handler(destination: string) {
  //     if (enabled) {
  //       openModal(destination)
  //       throw new Error('Navigation annulée pour confirmation')
  //     }
  //   }
  //
  //   Router.events.on('beforeHistoryChange', handler)
  //
  //   return () => {
  //     Router.events.off('beforeHistoryChange', handler)
  //   }
  // }, [enabled, openModal])
}

function useBeforeUnload(enabled: boolean) {
  const handler = useCallback(
    (event: BeforeUnloadEvent) => {
      if (!enabled) return

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
