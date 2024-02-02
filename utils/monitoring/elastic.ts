import { apm, init } from '@elastic/apm-rum'

export function initRum() {
  console.log('>>>', {
    app: process.env.APP,
    publicapp: process.env.NEXT_PUBLIC_APP,
  })

  const appName = process.env.NEXT_PUBLIC_APP || 'pa-front-local'
  init({
    serviceName: `rum-${appName}`,
    serverUrl: process.env.NEXT_PUBLIC_APM_URL || '',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    active: process.env.NEXT_PUBLIC_APM_IS_ACTIVE === 'true',
    distributedTracingOrigins: [process.env.NEXT_PUBLIC_API_ENDPOINT || ''],
  })
}

export function captureRUMError(error: Error | string) {
  if (typeof window !== 'undefined') {
    apm.captureError(error)
  }
}
