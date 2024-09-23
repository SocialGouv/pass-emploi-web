import { fetchJson } from 'utils/httpClient'

export async function getActualites() {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_CEJ_LINK as string
  const {
    content: {
      content: { rendered },
    },
  } = await fetchJson(url)

  return rendered
}
