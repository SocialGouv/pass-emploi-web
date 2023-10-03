'use client'

import { useEffect } from 'react'

import { initRum } from 'utils/monitoring/elastic'

export default function RealUserMonitoring() {
  useEffect(() => {
    initRum()
  }, [])

  return null
}
