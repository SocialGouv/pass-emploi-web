import HttpClient, {
  RequestError,
  ServerError,
  UnexpectedError,
} from 'utils/httpClient'

describe('HttpClient', () => {
  let httpClient: HttpClient
  beforeEach(() => {
    httpClient = new HttpClient()
  })

  describe('fetchJson', () => {
    let reqInfo: RequestInfo
    let reqInit: RequestInit
    let actual: any
    beforeEach(async () => {
      // Given
      reqInfo = '/api/path/whatever'
      reqInit = {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: {
          Authorization: `Bearer accessToken`,
        },
      }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: jest.fn(async () => ({ some: 'response' })),
      })

      // When
      actual = await httpClient.fetchJson(reqInfo, reqInit)
    })

    it('encapsulates call to fetch', () => {
      // Then
      expect(fetch).toHaveBeenCalledWith(reqInfo, reqInit)
    })

    it('returns response json', async () => {
      // Then
      expect(actual).toEqual({ some: 'response' })
    })

    describe('when call fails', () => {
      it('throws an UnexpectedError', async () => {
        // Given
        ;(fetch as jest.Mock).mockRejectedValue(
          new Error("J'ai perdu internet")
        )

        // When
        let error
        try {
          await httpClient.fetchJson('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new UnexpectedError("J'ai perdu internet"))
      })
    })

    describe('when response is a request error', () => {
      it('throws a RequestError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: jest.fn(async () => ({
            statusCode: 403,
            message: "La ressource ConseillerForJeune n'est pas autorisée",
            error: 'Forbidden',
          })),
        })

        // When
        let error
        try {
          await httpClient.fetchJson('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(
          new RequestError(
            "La ressource ConseillerForJeune n'est pas autorisée",
            'Forbidden'
          )
        )
      })
    })

    describe('when response is a server error', () => {
      it('throws a ServerError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal server error',
          json: jest.fn(async () => ({
            statusCode: 500,
            message: 'Internal server error',
          })),
        })

        // When
        let error
        try {
          await httpClient.fetchJson('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new ServerError('Internal server error'))
      })
    })

    describe('when authorization is expired', () => {
      it('forces reauthentication', async () => {
        // TODO
      })
    })
  })

  describe('fetchNoContent', () => {
    let reqInfo: RequestInfo
    let reqInit: RequestInit
    let actual: any
    beforeEach(async () => {
      // Given
      reqInfo = '/api/path/whatever'
      reqInit = {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: {
          Authorization: `Bearer accessToken`,
        },
      }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: jest.fn(async () => ({ some: 'response' })),
      })

      // When
      actual = await httpClient.fetchNoContent(reqInfo, reqInit)
    })

    it('encapsulates call to fetch', () => {
      // Then
      expect(fetch).toHaveBeenCalledWith(reqInfo, reqInit)
    })

    it('returns nothing', async () => {
      // Then
      expect(actual).toBeUndefined()
    })

    describe('when call fails', () => {
      it('throws an UnexpectedError', async () => {
        // Given
        ;(fetch as jest.Mock).mockRejectedValue(
          new Error("J'ai perdu internet")
        )

        // When
        let error
        try {
          await httpClient.fetchNoContent('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new UnexpectedError("J'ai perdu internet"))
      })
    })

    describe('when response is a request error', () => {
      it('throws a RequestError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: jest.fn(async () => ({
            statusCode: 403,
            message: "La ressource ConseillerForJeune n'est pas autorisée",
            error: 'Forbidden',
          })),
        })

        // When
        let error
        try {
          await httpClient.fetchNoContent('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(
          new RequestError(
            "La ressource ConseillerForJeune n'est pas autorisée",
            'Forbidden'
          )
        )
      })
    })

    describe('when response is a server error', () => {
      it('throws a ServerError', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal server error',
          json: jest.fn(async () => ({
            statusCode: 500,
            message: 'Internal server error',
          })),
        })

        // When
        let error
        try {
          await httpClient.fetchNoContent('/api/path/whatever')
        } catch (e) {
          error = e
        }

        // Then
        expect(error).toEqual(new ServerError('Internal server error'))
      })
    })

    describe('when authorization is expired', () => {
      it('forces reauthentication', async () => {
        // TODO
      })
    })
  })
})
