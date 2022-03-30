import { AgentConfigOptions, init } from '@elastic/apm-rum'

const serviceName = process.env.APP || 'pa-front-local'
const config: AgentConfigOptions = {
  serviceName: `rum-${serviceName}`,
  serverUrl: process.env.APM_URL || '',
  environment: process.env.ENVIRONMENT || 'development',
  active: process.env.APM_IS_ACTIVE === 'true',
  distributedTracingOrigins: [process.env.API_ENDPOINT || ''],
}

export function initRum() {
  return init(config)
}
