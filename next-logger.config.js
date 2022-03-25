const pino = require('pino')
const apm = require('elastic-apm-node')

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    messageKey: 'message',
    formatters: {
      level(label) {
        return { level: label }
      },
    },
    mixin: () => {
      const currentTraceIds = apm.currentTraceIds
      return !Object.keys(currentTraceIds).length ? {} : { currentTraceIds }
    },
  })

module.exports = {
  logger,
}
