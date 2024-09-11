import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
expect.extend(toHaveNoViolations)

global.fetch = jest.fn(async () => new Response())
if (typeof window !== 'undefined') {
  // https://github.com/jsdom/jsdom/issues/1695
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
  window.HTMLElement.prototype.scrollTo = jest.fn()
}

jest.mock('utils/analytics/useMatomo')
jest.mock('utils/hooks/useLeanBeWidget')

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT NOT_FOUND')
  }),
  redirect: jest.fn((destination) => {
    throw new Error('NEXT REDIRECT ' + destination)
  }),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))
jest.mock('next/headers', () => ({ headers: jest.fn() }))
jest.mock('next/dist/client/components/redirect', () => ({
  isRedirectError: jest.fn(({ message }) =>
    message.startsWith('NEXT REDIRECT')
  ),
}))

const session = {
  user: {
    id: 'idConseiller',
    estSuperviseur: false,
    estSuperviseurResponsable: false,
    structure: 'MILO',
  },
  accessToken: 'accessToken',
}
jest.mock('next-auth/react', () => ({
  getSession: async () => session,
}))
jest.mock('utils/auth/auth', () => ({
  getSessionServerSide: async () => session,
  getMandatorySessionServerSide: async () => session,
}))

afterEach(() => {
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
  cleanup()
})
