import { InfoFichier } from 'interfaces/fichier'
import { fetchJson, fetchNoContent } from 'utils/httpClient'

const apiPrefix = process.env.NEXT_PUBLIC_API_ENDPOINT

export async function apiGet<T>(
  path: string,
  accessToken: string,
  cacheTag?: string
): Promise<{ content: T; headers: Headers }> {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
  })
  const next = cacheTag ? { tags: [cacheTag] } : undefined

  return fetchJson(`${apiPrefix}${path}`, {
    headers,
    next,
  })
}

export async function apiPost<T = void>(
  path: string,
  payload: { [key: string]: any },
  accessToken: string
): Promise<{ content: T; headers: Headers }> {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  })

  const reqInit: RequestInit = {
    method: 'POST',
    headers,
  }
  if (payload && Object.keys(payload).length !== 0)
    reqInit.body = JSON.stringify(payload)

  return fetchJson(`${apiPrefix}${path}`, reqInit)
}

export async function apiPostFile(
  path: string,
  payload: FormData,
  accessToken: string
): Promise<InfoFichier> {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
  })

  const reqInit: RequestInit = {
    method: 'POST',
    headers,
  }
  if (payload) reqInit.body = payload

  const { content }: { content: InfoFichier } = await fetchJson(
    `${apiPrefix}${path}`,
    reqInit
  )
  return content
}

export async function apiPut(
  path: string,
  payload: { [key: string]: any },
  accessToken: string
): Promise<void> {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  })

  return fetchNoContent(`${apiPrefix}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
}

export async function apiPatch(
  path: string,
  payload: { [key: string]: any },
  accessToken: string
): Promise<void> {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  })

  return fetchNoContent(`${apiPrefix}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  })
}

export async function apiDelete(
  path: string,
  accessToken: string
): Promise<void> {
  const headers = new Headers({
    Authorization: `bearer ${accessToken}`,
    'content-type': 'application/json',
  })

  await fetchNoContent(`${apiPrefix}${path}`, {
    method: 'DELETE',
    headers,
  })
}
