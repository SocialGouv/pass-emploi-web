import { Actualites } from 'interfaces/actualites'
import { fetchJson } from 'utils/httpClient'

export async function getActualites(): Promise<Actualites | null> {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_CEJ_LINK
  if (!url) return null

  const {
    content: {
      modified,
      content: { rendered },
    },
  }: {
    content: { modified: string; content: { rendered: string } }
    headers: Headers
  } = await fetchJson(url)

  return { contenu: rendered, dateDerniereModification: modified }
}