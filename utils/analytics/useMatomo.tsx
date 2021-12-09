import { useEffect } from 'react'
import init from 'utils/analytics/matomo'

const MATOMO_URL = process.env.MATOMO_SOCIALGOUV_URL || ''
const MATOMO_SITE_ID = process.env.MATOMO_SOCIALGOUV_SITE_ID || ''

function useMatomo(title: string) {
  useEffect(() => {
    init({ url: MATOMO_URL, customTitle: title, siteId: MATOMO_SITE_ID })
  }, [title])
}

export default useMatomo
