import '@testing-library/jest-dom/extend-expect'
import { cleanup } from '@testing-library/react'

jest.mock('utils/analytics/useMatomo')
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
