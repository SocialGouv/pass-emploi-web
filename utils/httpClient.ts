import { redirect } from 'next/navigation'

import { captureError } from 'utils/monitoring/elastic'

export async function fetchJson(
  reqInfo: RequestInfo,
  reqInit?: RequestInit
): Promise<{ content: any; headers: Headers }> {
  const response = await callFetch(reqInfo, reqInit)

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return { content: await response.json(), headers: response.headers }
  }
  return { content: undefined, headers: response.headers }
}

export async function fetchNoContent(
  reqInfo: RequestInfo,
  reqInit?: RequestInit
): Promise<void> {
  await callFetch(reqInfo, reqInit)
}

async function callFetch(
  reqInfo: RequestInfo,
  reqInit?: RequestInit
): Promise<Response> {
  let reponse: Response
  try {
    reponse = await fetch(reqInfo, reqInit)
  } catch (e) {
    const error: UnexpectedError = new UnexpectedError(
      (e as Error).message || 'Unexpected error'
    )
    console.error(JSON.stringify(e))
    console.error('fetchJson exception', error)
    captureError(error)
    throw e
  }

  if (!reponse.ok) {
    await handleHttpError(reponse)
  }

  return reponse
}

async function handleHttpError(response: Response): Promise<void> {
  if (response.status === 401) {
    const logoutUrl = '/api/auth/federated-logout'
    if (typeof window !== 'undefined') {
      window.location.assign(logoutUrl)
    } else {
      redirect(logoutUrl)
    }
  }

  const json: any = await response.json()
  const message = json?.message || response.statusText
  const error = new ApiError(response.status, message)
  console.error('fetchJson error', error)
  captureError(error)
  throw error
}

export class ApiError implements Error {
  name = 'API_ERROR'

  constructor(
    readonly statusCode: number,
    readonly message: string
  ) {}
}

export class UnexpectedError implements Error {
  name = 'UNEXPECTED_ERROR'

  constructor(readonly message: string) {}
}
