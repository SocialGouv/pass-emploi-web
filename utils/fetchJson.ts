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
    console.error('fetchJson', e)
    throw e
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

  const message = (await response.json())?.message
  const error = new Error(message || response.statusText)
  console.error('fetchJson', error)
  throw error
}
