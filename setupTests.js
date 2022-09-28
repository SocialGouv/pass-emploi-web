import '@testing-library/jest-dom/extend-expect'
import { cleanup } from '@testing-library/react'

global.fetch = jest.fn(async () => ({ json: jest.fn(async () => ({})) }))
// https://github.com/jsdom/jsdom/issues/1695
window.HTMLElement.prototype.scrollIntoView = jest.fn()
window.HTMLElement.prototype.scrollTo = jest.fn()

jest.mock('utils/analytics/useMatomo')
jest.mock('utils/hooks/useLeanBeWidget')
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(),
  default: {
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  },
}))

afterEach(() => {
  cleanup()
})
