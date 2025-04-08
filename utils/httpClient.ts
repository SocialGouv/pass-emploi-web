import { redirect } from 'next/navigation'

import { captureError } from 'utils/monitoring/elastic'

export async function fetchJson(
  path: string,
  reqInit?: RequestInit
): Promise<{ content: any; headers: Headers }> {
  const response = await callFetch(path, reqInit)

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return { content: await response.json(), headers: response.headers }
  }
  return { content: undefined, headers: response.headers }
}

export async function fetchNoContent(
  path: string,
  reqInit?: RequestInit
): Promise<void> {
  await callFetch(path, reqInit)
}

async function callFetch(
  path: string,
  reqInit?: RequestInit
): Promise<Response> {
  let reponse: Response
  try {
    reponse = await fetch(path, reqInit)
  } catch (e) {
    const error: UnexpectedError = new UnexpectedError(
      (e as Error).message || 'Unexpected error'
    )
    console.error(`fetchJson exception at ${path}`, error)
    captureError(error)
    throw error
  }

  if (!reponse.ok) {
    await handleHttpError(reponse, path)
  }

  return reponse
}

async function handleHttpError(
  response: Response,
  path: string
): Promise<void> {
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
  console.error(`fetchJson error at ${path}`, error)
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
