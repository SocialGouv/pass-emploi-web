import '@testing-library/jest-dom/extend-expect'
import { cleanup } from '@testing-library/react'

jest.mock('utils/analytics/useMatomo')

afterEach(() => {
  cleanup()
})
