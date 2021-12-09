import { useEffect } from 'react'
import { track } from 'utils/analytics/matomo'

function useMatomo(title: string | undefined) {
  useEffect(() => {
    if (!title) {
      return
    }

    track({ customTitle: title })
  }, [title])
}

export default useMatomo
