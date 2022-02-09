export default async function fetchJson(
  reqInfo: RequestInfo,
  reqInit?: RequestInit
): Promise<any> {
  try {
    const response = await fetch(reqInfo, reqInit)

    if (response.ok) {
      if (
        !response.headers.has('content-length') ||
        parseInt(response.headers.get('content-length')!, 10) > 0
      ) {
        return response.json()
      }
      return
    }

    if (response.status === 401) {
      //ce reload permet de donner la main au SSR pour le cas non-autorisé (refreshtoken expiré).
      //présent dans withMandatorySessionOrRediect
      //TODO trouver une solution propre
      window.location.reload()
    }

    const message = (await response.json())?.message
    throw new Error(message || response.statusText)
  } catch (error) {
    console.error('fetchJson', error)
    throw error
  }
}
