export default async function fetchJson(reqInfo: RequestInfo, reqInit?: RequestInit) {
  try {
    const response = await fetch(reqInfo, reqInit)

    const data = await response.json()

    if (response.ok) {
      return data
    }

    const error = new Error(response.statusText)
    throw error
  } catch (error) {
      console.error('fetchJson', error)
  }
}