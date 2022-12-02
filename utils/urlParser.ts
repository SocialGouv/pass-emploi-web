export function parseUrl(url: string): {
  baseUrl: string
  query: Record<string, string | string[]>
} {
  const [baseUrl, queryString] = url.split('?')
  const query = queryString
    ? queryString.split('&').reduce((dict, param) => {
        const [key, value] = param.split('=')
        if (dict[key] && Array.isArray(dict[key]))
          dict[key] = [...(dict[key] as string[]), value]
        else if (dict[key]) dict[key] = [dict[key] as string, value]
        else dict[key] = value
        return dict
      }, {} as Record<string, string | string[]>)
    : {}
  return { baseUrl, query }
}

export function setQueryParams(
  query: Record<string, string | string[]>,
  params: Record<string, string | string[]>
): Record<string, string | string[]> {
  return Object.entries(params).reduce(
    (updatedQuery, [key, value]) => ({ ...updatedQuery, [key]: value }),
    query
  )
}

export function deleteQueryParams(
  query: Record<string, string | string[]>,
  params: string[]
): Record<string, string | string[]> {
  const updateQuery = { ...query }
  params.forEach((param) => delete updateQuery[param])
  return updateQuery
}
