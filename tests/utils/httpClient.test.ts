import HttpClient, { ApiError, UnexpectedError } from 'utils/httpClient'

describe('HttpClient', () => {
  let httpClient: HttpClient
  beforeEach(() => {
    httpClient = new HttpClient()
  })

  describe('fetchJson', () => {
    let reqInfo: RequestInfo
    let reqInit: RequestInit
    let responseHeaders: Headers
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
      responseHeaders = new Headers({
        'content-type': 'application/json',
        'default-header-1': 'defaultHeader',
        'x-custom-header-1': 'customHeader1',
      })
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: responseHeaders,
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
      expect(actual).toEqual({
        content: { some: 'response' },
        headers: responseHeaders,
      })
    })

    describe('when response has no content', () => {
      it('returns nothing ', async () => {
        // Given
        ;(fetch as jest.Mock).mockResolvedValue({
          ok: true,
          headers: new Headers(),
          json: jest.fn().mockRejectedValue(new Error('Error parsing Json')),
        })

        // When
        actual = await httpClient.fetchJson(reqInfo, reqInit)

        // Then
        expect(actual).toEqual({ content: undefined, headers: new Headers() })
      })
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
      it('throws a ApiError', async () => {
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
          new ApiError(
            403,
            "La ressource ConseillerForJeune n'est pas autorisée"
          )
        )
      })
    })

    describe('when response is a server error', () => {
      it('throws a ApiError', async () => {
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
        expect(error).toEqual(new ApiError(500, 'Internal server error'))
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
      it('throws a ApiError', async () => {
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
          new ApiError(
            403,
            "La ressource ConseillerForJeune n'est pas autorisée"
          )
        )
      })
    })

    describe('when response is a server error', () => {
      it('throws a ApiError', async () => {
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
        expect(error).toEqual(new ApiError(500, 'Internal server error'))
      })
    })

    describe('when authorization is expired', () => {
      it('forces reauthentication', async () => {
        // TODO
      })
    })
  })
})
