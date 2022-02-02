const pino = require('pino')

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    messageKey: 'message',
    formatters: {
      level(label) {
        return { level: label }
      },
    },
  })

module.exports = {
  logger,
}
