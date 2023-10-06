import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

global.fetch = jest.fn(async () => new Response())
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

jest.mock('next-auth/react', () => ({
  getSession: async () => ({
    user: {
      id: 'idConseiller',
      estSuperviseur: false,
      estSuperviseurPEBRSA: false,
      structure: 'PASS_EMPLOI',
    },
    accessToken: 'accessToken',
  }),
}))

afterEach(() => {
  sessionStorage.clear()
  cleanup()
})
