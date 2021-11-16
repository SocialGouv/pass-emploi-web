/**
 * we don't need to use CSS files during tests,
 *  so we can mock them out the test suites by mapping every .css import to a mock file
 *
 * see: https://jestjs.io/docs/webpack#handling-static-assets
 */

module.exports = {}
