export default async function fetchJson<T>(
  reqInfo: RequestInfo,
  reqInit?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(reqInfo, reqInit)

    if (response.ok) {
      return response.json()
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
