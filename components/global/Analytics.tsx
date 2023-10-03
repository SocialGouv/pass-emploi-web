'use client'

import { useEffect } from 'react'

import { init as initMatomo } from 'utils/analytics/matomo'

const MATOMO_URL = process.env.MATOMO_SOCIALGOUV_URL || ''
const MATOMO_SITE_ID = process.env.MATOMO_SOCIALGOUV_SITE_ID || ''

export default function Analytics() {
  useEffect(() => {
    initMatomo({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
  }, [])

  return null
}
