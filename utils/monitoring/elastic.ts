import { apm as rum, init } from '@elastic/apm-rum'
import apm from 'elastic-apm-node'

export function initRum() {
  const appName = process.env.APP || 'pa-front-local'
  init({
    serviceName: `rum-${appName}`,
    serverUrl: process.env.NEXT_PUBLIC_APM_URL || '',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    active: process.env.NEXT_PUBLIC_APM_IS_ACTIVE === 'true',
    distributedTracingOrigins: [process.env.NEXT_PUBLIC_API_ENDPOINT || ''],
  })
}

export function captureError(error: Error | string) {
  if (typeof window !== 'undefined') {
    rum.captureError(error)
  } else {
    apm.captureError(error)
  }
}
