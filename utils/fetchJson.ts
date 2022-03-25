import { captureRumError } from 'utils/monitoring/init-rum'

export async function fetchJson(
  reqInfo: RequestInfo,
  reqInit?: RequestInit
): Promise<any> {
  const response = await callFetch(reqInfo, reqInit)

  if (
    !response.headers.has('content-length') ||
    parseInt(response.headers.get('content-length')!, 10) > 0
  ) {
    return response.json()
  }
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
    console.error('fetchJson exception', error)
    captureRumError(error)
    throw error
  }

  if (!reponse.ok) {
    await handleError(reponse)
  }

  return reponse
}

async function handleError(response: Response): Promise<void> {
  if (response.status === 401) {
    //ce reload permet de donner la main au SSR pour le cas non-autorisé (refreshtoken expiré).
    //présent dans withMandatorySessionOrRediect
    //TODO trouver une solution propre
    window.location.reload()
  }

  const json: any = await response.json()
  const message = json?.message || response.statusText
  const error =
    response.status < 500
      ? new RequestError(message, json?.code)
      : new ServerError(message)
  console.error('fetchJson error', error)
  captureRumError(error)
  throw error
}

export class RequestError implements Error {
  name = 'REQUEST_ERROR'

  constructor(readonly message: string, readonly code?: string) {}
}

export class ServerError implements Error {
  name = 'SERVER_ERROR'

  constructor(readonly message: string) {}
}

export class UnexpectedError implements Error {
  name = 'UNEXPECTED_ERROR'

  constructor(readonly message: string) {}
}
