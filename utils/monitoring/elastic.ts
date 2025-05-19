import { apm as rum, init } from '@elastic/apm-rum'
import apm from 'elastic-apm-node'

export function initRum() {
  const appName = process.env.APP || 'pa-front-local'
  const options = {
    serviceName: `rum-${appName}`,
    serverUrl: process.env.NEXT_PUBLIC_ELASTIC_APM_SERVER_URL,
    environment:
      process.env.NEXT_PUBLIC_ELASTIC_APM_ENVIRONMENT || 'development',
    active: process.env.NEXT_PUBLIC_ELASTIC_APM_ACTIVE === 'true',
    distributedTracingOrigins: [process.env.NEXT_PUBLIC_API_ENDPOINT || ''],
  }

  init(options)
}

export function captureError(error: Error | string) {
  if (typeof window !== 'undefined') {
    rum.captureError(error)
  } else {
    apm.captureError(error)
  }
}
