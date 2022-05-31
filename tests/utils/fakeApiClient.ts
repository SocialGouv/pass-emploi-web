import { ApiClient } from 'clients/api.client'

export class FakeApiClient implements ApiClient {
  delete = jest.fn()
  get = jest.fn()
  post = jest.fn()
  put = jest.fn()
}
