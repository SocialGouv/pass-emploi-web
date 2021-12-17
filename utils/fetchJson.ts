export default async function fetchJson<T>(
  reqInfo: RequestInfo,
  reqInit?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(reqInfo, reqInit)

    if (response.ok) {
      return response.json()
    }

    const message = (await response.json())?.message
    throw new Error(message || response.statusText)
  } catch (error) {
    console.error('fetchJson', error)
    throw error
  }
}
